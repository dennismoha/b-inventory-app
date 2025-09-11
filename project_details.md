# use mermaid view to view these steps.

# Auth 
    ## Flowchart

    flowchart TD
        A[Start: POST /login] --> B[Extract email & password]
        B --> C[Find user by email]

        C -->|User not found| E1[Throw Invalid email or password]
        C -->|User found| D[Compare password with hashed]

        D -->|Invalid password| E2[Throw Invalid email or password]
        D -->|Valid password| F[Check user role]

        F -->|role == 'user'| G[Check active login session]
        G -->|Session exists| H[Log failed attempt with IP & agent]
        H --> I[Throw Already logged in from another device]
        G -->|No active session| J[Proceed to login]

        F -->|role != 'user'| J[Proceed to login]

        J --> K[Create new userLoginLog loginTime, isLoggedIn = true]
        K --> L[Build JWT payload]

        L --> M[Generate JWT token]
        M --> N[Store token in req.session]
        N --> O[Set req.currentUser]

        O --> P[Return 200 OK with token & user info]

    ## Sequence Diagram

    sequenceDiagram
    participant Client
    participant Express
    participant Prisma
    participant Bcrypt
    participant JWT
    participant Session

    Client->>Express: POST /login (email, password)
    Express->>Prisma: findUnique({ email })
    alt User not found
        Express-->>Client: 400 BadRequest ("Invalid email or password")
    else User found
        Express->>Bcrypt: compare(password, user.password)
        alt Password invalid
            Express-->>Client: 400 BadRequest ("Invalid email or password")
        else Password valid
            alt Role is "user"
                Express->>Prisma: findFirst({ isLoggedIn: true, userId })
                alt Active session exists
                    Express->>Prisma: create userLoginAttempt (FAILED_ACTIVE_SESSION)
                    Express-->>Client: 400 BadRequest ("Already logged in")
                else No active session
                    Express->>Prisma: create userLoginLog (isLoggedIn = true)
                end
            else Role is not "user"
                Express->>Prisma: create userLoginLog (isLoggedIn = true)
            end

            Express->>JWT: sign({ email, username, role })
            JWT-->>Express: token

            Express->>Session: req.session = { jwt: token }
            Express->>Session: req.currentUser = { user }

            Express-->>Client: 200 OK (message, token, user)
        end
    end


## Auth + pos

sequenceDiagram
    participant User
    participant Frontend
    participant AuthAPI
    participant DB
    participant SessionAPI
    participant Redux

    User->>Frontend: Enter email & password
    Frontend->>AuthAPI: POST /login
    AuthAPI->>DB: Find user by email
    DB-->>AuthAPI: Return user or null

    alt User not found
        AuthAPI-->>Frontend: Error "Invalid credentials"
    else User found
        AuthAPI->>AuthAPI: Compare password (bcrypt)
        alt Password mismatch
            AuthAPI-->>Frontend: Error "Invalid credentials"
        else Password match
            AuthAPI->>DB: Check active login for 'user' role
            alt Already logged in elsewhere
                AuthAPI->>DB: Log failed attempt
                AuthAPI-->>Frontend: Error "Already logged in on another device"
            else No active session
                AuthAPI->>DB: Create login log (isLoggedIn: true)
                AuthAPI->>AuthAPI: Generate JWT token
                AuthAPI-->>Frontend: Return token + user
                Frontend->>Redux: Dispatch setCredentials(token, user)
                Frontend->>Frontend: Redirect based on role
            end
        end
    end

    Note over Frontend, Redux: On all protected pages
    Frontend->>Redux: Check posSessionId
    alt posSessionId missing
        Frontend->>SessionAPI: GET /pos-session
        alt Session exists
            SessionAPI-->>Frontend: Return sessionId
            Frontend->>Redux: Dispatch setPosSessionId
            Frontend->>Frontend: Navigate to /pos
        else 404 Not Found
            Frontend->>User: Prompt "Start Session?"
            User->>Frontend: Click start session
            Frontend->>SessionAPI: POST /start-session
            SessionAPI-->>Frontend: Return sessionId
            Frontend->>Redux: Dispatch setPosSessionId
            Frontend->>Frontend: Navigate to /pos
        end
    else Session exists
        Frontend->>Frontend: Continue with POS page
    end

   


    1) Seller pos view and process

    flowchart TD
    Login[User logs in] --> ShowItems[Show available products]

    ShowItems --> ClickProduct[User clicks on a product]
    ClickProduct --> CheckStock{Stock > 0?}
    CheckStock -- No --> ErrorStock[Show error: Stock too low]
    CheckStock -- Yes --> CheckPrice{Is product priced?}
    CheckPrice -- No --> ErrorPrice[Show error: Product not priced]
    CheckPrice -- Yes --> AddToCart[Add 1 unit to cart]

    AddToCart --> UpdateTotal[Update total payable]
    AddToCart --> IncreaseQty[User increases quantity manually]
    IncreaseQty --> CheckStock

    AddToCart --> CustomerSelect[User selects customer]
    CustomerSelect --> CheckCustomer{Customer selected?}
    CheckCustomer -- No --> ErrorCustomer[Show error: No customer selected]
    CheckCustomer -- Yes --> ChoosePayment[User selects payment method]

    ChoosePayment --> IsCard{Payment method is Card?}
    IsCard -- Yes --> ShowCardFields[Show card reference input]
    IsCard -- No --> SkipCard[Skip card input]

    ShowCardFields --> ConfirmSale
    SkipCard --> ConfirmSale

    ConfirmSale[User clicks Pay] --> ShowModal[Show confirmation modal]
    ShowModal --> ConfirmChoice{Confirm details correct?}
    ConfirmChoice -- No --> ReturnEdit[Return to edit]
    ConfirmChoice -- Yes --> SubmitBackend[Send order to backend]

# After user clicks on submit.

    flowchart TD
    A[Start: Incoming Request] --> B{{POS Session Header Present?}}
    B -- No --> B1[Throw Error: No POS Session]
    B -- Yes --> C[Proceed to Middleware next]

    C --> D[Joi Validation on req.body]
    D -- Invalid --> D1[Throw Validation Error]
    D -- Valid --> E[Destructure req.body:\ncartProducts, customerId,\npaymentMethod, totalCost]

    E --> F[Start DB Transaction]

    F --> G[Generate UUID for transactionId]
    G --> H[Insert into Transactions Table]

    H --> I[Loop through cartProducts]
    I --> I1[Deduct stock_quantity from Inventory]
    I1 --> I2[Insert into TransactionProducts table]

    I2 --> J[Insert each item into Sales Table]

    J --> K{{Is Payment Method Credit?}}
    
    K -- Yes --> K1[Insert into Receivables Table:\ntransactionId, customerId, total_cost]
    
    K -- No (Cash) --> L[Handle Cash Payment Flow]

    L --> L1[Fetch opening_closing_balance_id from openingnclosingbalance table using POS Session]
    L1 --> L2[Fetch Cash Sales Account details from Accounts Table]
    L2 --> L3[Update Account Logs 'Debit In']
    L3 --> L4[Calculate balance_after =\ncurrent_balance + total_cost]
    L4 --> L5[Insert into CashBookLedger]

    K1 --> M[Insert into Transaction Log]
    L5 --> M

    M --> N[Return transaction_products as Receipt]
    N --> O[res.json with 201 status]



# purchase flow

sequenceDiagram
    participant Supplier
    participant System
    participant Purchase
    participant BatchInventory
    participant InventoryStock
    participant Sales
    participant BatchHistory
    participant BatchPayables

    Supplier->>System: Deliver Goods
    System->>Purchase: Record purchase (qty, damages, costs)
    Purchase->>BatchInventory: Create new batch (stock = undamaged qty)

    alt Admin activates batch
        BatchInventory->>InventoryStock: Create / Update stock
    else Auto-activate (when prev batch finished)
        BatchInventory->>InventoryStock: Auto set ACTIVE
    end

    Sales->>InventoryStock: Sell item (reduce stock)
    InventoryStock->>BatchInventory: Update sold_quantity
    InventoryStock->>Sales: Record sale transaction

    alt Stock Depleted
        InventoryStock->>BatchInventory: Mark FINISHED
        BatchInventory->>BatchHistory: Log history
        System->>BatchInventory: Activate next batch
    end

    alt Purchase not fully paid
        Purchase->>BatchPayables: Record balance due
        BatchPayables->>System: Track until settled
    end


# ERD

erDiagram

    Purchase ||--|| BatchInventory : "creates"
    BatchInventory ||--|| InventoryStock : "activates into"
    InventoryStock ||--o{ Sales : "used in"
    BatchInventory ||--o{ BatchHistory : "logs changes"
    Purchase ||--|| BatchPayables : "generates"
    
    Purchase {
      string purchase_id
      string batch
      uuid supplier_products_id
      int quantity
      int damaged_units
      decimal total_purchase_cost
      enum status
    }

    BatchInventory {
      string batch_inventory_id
      uuid purchase_id
      int stock_quantity
      int sold_quantity
      enum status
    }

    InventoryStock {
      string inventory_id
      uuid supplier_product_id
      int stock_quantity
      enum status
    }

    Sales {
      string sales_id
      uuid inventory_id
      int quantity_sold
      decimal total_amount
      datetime sale_date
    }

    BatchHistory {
      string history_id
      uuid batch_inventory_id
      enum prev_status
      enum new_status
      int quantity_remaining
      int total_sold
    }

    BatchPayables {
      string payable_id
      uuid purchase_id
      decimal amount_due
      decimal balance_due
      enum status
    }

# Automatic batch update:

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


## Back orders

    sequenceDiagram
        participant Customer
        participant Sales
        participant BatchInventory
        participant Backorders

        Customer->>Sales: Order 100 units
        Sales->>BatchInventory: Check available stock

        alt Batch has 90, no next batch
            Sales->>Customer: "Only 90 available"
            alt Mode = PARTIAL
                Sales->>Sales: Complete sale for 90
            else Mode = BACKORDER
                Sales->>Backorders: Create record for 10 pending
            else Mode = STRICT
                Sales->>Customer: Reject order
            end
        end



