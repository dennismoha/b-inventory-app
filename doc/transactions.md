# deduct batch

# main transaction.
# Architecture
flowchart TD

    POS[POS User] -->|Checkout| API[Checkout API]
    API -->|DB Transaction| DB[(Main Database)]

    DB -->|Insert| Sales[(Sales / Transactions)]
    DB -->|Update| Batch[(BatchInventory)]
    DB -->|Update| Stock[(InventoryStock)]
    DB -->|Update| Summary[(ProductSummary)]
    DB -->|Insert| Ledger[(Ledger Entries)]

    Reports[Reports / Dashboard] --> DB


flowchart TD
    %% FRONTEND
    A[User visits /pos] --> B[Fetch InventoryItems from backend]
    B -->|Map to newInventory| C[POS UI renders stock & pricing]

    %% ADD TO CART
    C --> D[User clicks 'Add to cart']
    D -->|Check validations| E{Validations}
    E -->|No customer| E1[Error: must select or create 'walk-in' customer]
    E -->|Qty > stock_quantity| E2[Error: quantity exceeds stock]
    E -->|Non-priced item| E3[Error: cannot select non-priced item]
    E -->|Valid| F[Update cartProducts state]

    %% SUBMIT TRANSACTION
    F --> G[User selects payment type]
    G -->|Cash or Credit| H[Submit transaction → Backend]

    %% BACKEND MIDDLEWARE
    H --> I{Check req.headers 'pos_session'}
    I -->|Missing| I1[Error: No active POS session]
    I -->|Exists| J[Validate request with Joi]

    %% START TRANSACTION
    J -->|Valid| K[Begin DB Transaction]
    K --> L[Generate transactionId UUID]
    L --> M[Insert into Transaction Table]

    %% PROCESS CART
    M --> N[Loop through cartProducts]
    N --> O{Stock check in InventoryStock}
    O -->|Sufficient| P[Deduct from InventoryStock, BatchInventory, ProductStockSummary]
    O -->|Insufficient| Q{Next batch exists?}
    Q -->|No| Q1[Error: Insufficient stock, rollback Tx]
    Q -->|Yes| R[Split allocation FIFO: use current + next batch]
    R --> S[Update BatchLifecycle ended_at when finished]
    S --> T[Load next batch into InventoryStock]

    %% RECORD TRANSACTIONPRODUCT
    P --> U[Insert into TransactionProduct table]
    R --> U

    %% PAYMENT FLOW
    U --> V{Payment Method}
    V -->|Cash| W[Update Accounts → credit 'cash sales']
    W --> X[Insert inflow into CashBookLedger using pos_session]
    V -->|Credit| Y[Insert record into CustomerReceivables]

    %% END
    X --> Z[Commit DB Transaction]
    Y --> Z
    Z --> Z1[Return 201 + transactionProducts receipt]

# sequence diagram2

sequenceDiagram
    autonumber
    actor User
    participant POS_UI as POS Frontend (/pos)
    participant API as Backend API
    participant Middleware as POS Middleware
    participant Validator as Joi Validator
    participant DB as Database (Prisma/SQL)
    participant Inventory as InventoryStock + BatchInventory + ProductSummary
    participant Ledger as CashBookLedger/Receivables
    participant Lifecycle as BatchLifecycle

    %% User actions
    User ->> POS_UI: Visit /pos
    POS_UI ->> API: Fetch inventory data
    API -->> POS_UI: Returns inventory list

    User ->> POS_UI: Add item(s) to cart
    POS_UI ->> API: Send cart payload (cartProducts, customerId, paymentMethod, etc.)

    %% Middleware
    API ->> Middleware: Check req.headers['pos_session']
    Middleware -->> API: Valid / Error (if missing)

    %% Validation
    API ->> Validator: Validate payload with Joi
    Validator -->> API: Valid / Error (if missing fields)

    %% Transaction init
    API ->> DB: Begin Transaction
    API ->> DB: Create Transaction record (transactionId, totals, customer, paymentMethod)

    %% Stock checks
    loop For each product in cartProducts
        API ->> Inventory: Check stock_quantity
        alt Stock sufficient
            API ->> Inventory: Deduct from InventoryStock
            API ->> Inventory: Update BatchInventory.sold_quantity
            API ->> Inventory: Update ProductSummary.remaining_stock
        else Stock insufficient (but next batch exists)
            API ->> Inventory: Allocate remaining qty from next batch (FIFO)
            API ->> Lifecycle: Mark old batch ended (ended_at, totals)
            API ->> Inventory: Load new batch to InventoryStock
            API ->> Inventory: Deduct remaining qty from new batch
        else No stock in next batch
            API -->> User: Error (Insufficient stock)
            DB -->> API: Rollback Transaction
        end
        API ->> DB: Insert into TransactionProduct (log per item, costs, VAT, discount)
    end

    %% Payment Processing
    alt PaymentMethod == "cash"
        API ->> Ledger: Credit cash account (CashBookLedger)
        API ->> Ledger: Update account current_balance
    else PaymentMethod == "credit"
        API ->> Ledger: Insert CustomerReceivables record
    else PaymentMethod == "bank"
        API ->> Ledger: Insert into CashBookLedger with method "bank"
    end

    %% Commit
    API ->> DB: Commit Transaction
    API -->> POS_UI: Return 201 + TransactionProducts (receipt)
    POS_UI -->> User: Show receipt/confirmation




sequenceDiagram
        participant Customer
        participant Sales
        participant SalesDetails
        participant BatchInventory
        participant BatchLifecycle
        participant ProductStockSummary

    Customer->>Sales: Order 100 units
    Sales->>BatchInventory: Fetch FIFO batches for product

    alt Batch A has 90
        Sales->>SalesDetails: Create record (90 from Batch A)
        SalesDetails->>BatchInventory: Deduct 90, stock=0
        BatchInventory->>BatchLifecycle: ended_at=NOW, status=ENDED
    end

    alt Batch B has remaining
        Sales->>SalesDetails: Create record (10 from Batch B)
        SalesDetails->>BatchInventory: Deduct 10, stock=140
        BatchInventory->>BatchLifecycle: if first usage → started_at=NOW
    end

    SalesDetails->>ProductStockSummary: Update totals
    Sales->>Accounts: Update running balance
    Sales->>Ledger: Record transaction


    # backend transaction flow

    flowchart TD

  A[User clicks Submit] --> B[Frontend validates cartProducts, customerId, etc.]
  B --> C{Customer selected?}
  C -- No --> C1[Error: No Customer Selected]
  C -- Yes --> D{All items priced and stock available?}
  D -- No --> D1[Error: Invalid cart items]
  D -- Yes --> E[Send payload to backend]

  E --> F[Middleware: Check pos_session in headers]
  F -- Missing --> F1[Error: POS Session Missing]
  F -- Exists --> G[Validate Payload with Joi]
  G -- Invalid --> G1[Validation Error]
  G -- Valid --> H[Destructure req.body]

  H --> I[Start DB Transaction]
  I --> J[Generate transaction_id UUID]
  J --> K[Create Transaction record]
  K --> L[Deduct stock from Inventory  batch_inventory_id  ]
  L --> M[Loop through cartProducts for Sales records]
  M --> N{Payment Method is Credit?}

  N -- Yes --> O[Insert into Receivables Table]
  N -- No --> P[Fetch pos_session and balance ID]
  P --> Q[Fetch cash sales account]
  Q --> R[Insert into CashBook Ledger]
  R --> S[Update account logs  debit  ]

  O --> T[Create Transaction Log]
  S --> T

  T --> U[Commit DB Transaction]
  U --> V[Return transaction_products as receipt]

  %% Error Handling
  I -->|Any failure| W[Rollback Transaction]
  W --> X[Return Error to user]

  %% Reporting Goals
  V --> Y[Enable: daily sales, credit analysis, profit/loss per batch]


# transaction flow 2

flowchart TD
  A[User clicks 'Submit'] --> B[Frontend validates cartProducts, customerId, etc.]
  B --> C{Customer selected?}
  C -- No --> C1[Throw Error: No Customer Selected]
  C -- Yes --> D{All items priced and stock available?}
  D -- No --> D1[Throw Error: Invalid cart items]
  D -- Yes --> E[Send payload to backend]

  E --> F[Backend Middleware: Check pos_session in headers]
  F -- Missing --> F1[Throw Error: POS Session Missing]
  F -- Exists --> G[Validate Payload with Joi]
  G -- Invalid --> G1[Throw Joi Validation Error]
  G -- Valid --> H[Destructure req.body: cartProducts, customerId, paymentMethod, totalCost]

  H --> I[Start DB Transaction]

  I --> J[Generate transaction_id UUID]
  J --> K[Insert Transaction record receipt]
  K --> L[Deduct stock_quantity from Inventory by batch_inventory_id]
  L --> M[Loop through cartProducts to create Sales Records]
  M --> N{Payment Method = Credit?}

  N -- Yes --> O[Insert into Receivables Table]
  N -- No --> P[Fetch pos_session & opening_closing_balance_id]
  P --> Q[Fetch cash sales account from accounts]
  Q --> R[Insert into CashBookLedger]
  R --> S[Update account logs with debit & balance_after]

  O & S --> T[Create Transaction Log]
  T --> U[Commit DB Transaction]
  U --> V[Return transaction_products as receipt]

  %% Error paths
  I -->|Any failure| W[Rollback DB Transaction]
  W --> X[Return Error]

  %% Reporting & Goals
  V --> Y[Can now calculate total sales, credits, customer patterns, etc.]
