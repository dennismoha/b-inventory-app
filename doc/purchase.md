flowchart TD

%% Start
A([Start: User creates purchase]) --> B[Validate Inputs]

%% Validations
B -->|Batch ID not unique| E1[Error: Batch ID already exists]
B -->|Damaged > Quantity| E2[Error: Damaged units exceed quantity]
B -->|No Payment Method| E3[Error: Payment method required]
B -->|No Account when required| E4[Error: No account selected]
B -->|Purchase Cost > Account Balance| E5[Error: Insufficient account balance]
B -->|All checks pass| C[Insert into Purchase table]

%% Damage Recording
C --> D{Damaged units > 0?}
D -->|Yes| D1[Insert PurchaseDamage record]
D -->|No| E[Skip damage recording]

%% Inventory Recording
D1 --> E
E[Insert BatchInventory: total_units = quantity - damaged_units]

%% Payment Handling
E --> F{Payment Type == Credit?}
F -->|Yes| G[Insert into BatchPayables table]
F -->|No| H[Insert into CashBookLedger table]

%% End
G --> Z([Return: Purchase created successfully])
H --> Z


# purchase with accounts.

flowchart TD
    A[Start: Incoming Request to /purchase] --> B[Extract and Validate POS Session Header]
    B --> C[Find OpeningClosingBalance with status 'PREV']
    C --> D[Set opening_closing_balance globally]

    D --> E[Validate Purchase Payload with Joi]
    E --> F[Check damaged_units <= quantity]
    F --> G[Begin DB Transaction]

    G --> H{Does Batch Already Exist?}
    H -- Yes --> Z1[Throw Error:Batch already exists ]
    H -- No --> I{Payment Type?}

    I -- full --> J[Create Purchase Record Full Payment]
    J --> K[Record Damage if Any]
    K --> L[Create Batch Inventory]
    L --> M[Log Cashbook Entry]

    M --> N[Call Accounts.adjustBalance]
    N --> O[Log to AccountsLog Table]

    I -- credit --> J1[Create Purchase Record Credit]
    J1 --> K1[Record Damage if Any]
    K1 --> L1[Create Batch Inventory]
    L1 --> M1[Create Batch Payables]

    M1 --> R[Commit Transaction]
    N --> R
    M --> R

    R --> S[Return 201 Success Response]
    Z1 --> T[Return 400 Error Response]

    subgraph Reusable Logic
        N[adjustBalance Utility]
        O[accountsLog.create]
    end

    subgraph Ledger Entry
        M[CashBookLedger.create]
    end



# purchase + accounts

flowchart TD
    A[Start: Incoming Request to /purchase] --> B[Extract and Validate POS Session Header]
    B --> C[Find OpeningClosingBalance with status 'PREV']
    C --> D[Set opening_closing_balance globally]

    D --> E[Validate Purchase Payload with Joi]
    E --> F[Check damaged_units <= quantity]
    F --> G[Begin DB Transaction]

    G --> H{Does Batch Already Exist?}
    H -- Yes --> Z1[Throw Error:Batch already exists ]
    H -- No --> I{Payment Type?}

    I -- full --> J[Create Purchase Record Full Payment]
    J --> K[Record Damage if Any]
    K --> L[Create Batch Inventory]
    L --> M[Log Cashbook Entry]

    M --> N[Call Accounts.adjustBalance]
    N --> O[Log to AccountsLog Table]

    I -- credit --> J1[Create Purchase Record Credit]
    J1 --> K1[Record Damage if Any]
    K1 --> L1[Create Batch Inventory]
    L1 --> M1[Create Batch Payables]

    M1 --> R[Commit Transaction]
    N --> R
    M --> R

    R --> S[Return 201 Success Response]
    Z1 --> T[Return 400 Error Response]

    subgraph Reusable Logic
        N[adjustBalance Utility]
        O[accountsLog.create]
    end

    subgraph Ledger Entry
        M[CashBookLedger.create]
    end




flowchart TD

%% Start
A([Start: User creates purchase]) --> B[Validate Inputs]

%% Validations
B -->|Batch ID not unique| E1[Error: Batch ID already exists]
B -->|Damaged > Quantity| E2[Error: Damaged units exceed quantity]
B -->|No Payment Method| E3[Error: Payment method required]
B -->|No Account when required| E4[Error: No account selected]
B -->|Purchase Cost > Account Balance| E5[Error: Insufficient account balance]
B -->|All checks pass| C[Insert into Purchase table]

%% Damage Recording
C --> D{Damaged units > 0?}
D -->|Yes| D1[Insert PurchaseDamage record]
D -->|No| E[Skip damage recording]

%% Inventory Recording
D1 --> E
E[Insert BatchInventory: total_units = quantity - damaged_units]

%% Payment Handling
E --> F{Payment Type == Credit?}
F -->|Yes| G[Insert into BatchPayables table]
F -->|No| H[Insert into CashBookLedger table]

%% End
G --> Z([Return: Purchase created successfully])
H --> Z


flowchart TD

    A[API Request: POST /purchase] --> B[Validate Request Body Joi]
    B --> C[Extract pos_session_id from headers]

    C --> D[Find OpeningClosingBalance with status PREV]
    D --> E[Set PurchaseController.opening_closing_balance]

    E --> F{payment_type}
    F -->|full| G[handleFullPayment]
    F -->|credit| H[handleCreditPayment]
    F -->|unsupported| Z[Throw Error: Unsupported payment_type]

    %% Full Payment Flow
    G --> G1[Create Purchase Record tx.purchase.create]
    G1 --> G2{Any Damaged Units?}
    G2 -->|yes| G3[Record Damage tx.purchaseDamage.create]
    G2 -->|no| G4[Skip Damage Recording]
    G3 --> G5[Create Batch Inventory]
    G4 --> G5[Create Batch Inventory]

    G5 --> G6[Log Cashbook Entry]
    G6 --> G6a[Check opening_closing_balance]
    G6a -->|present| G7[Insert Ledger Record tx.cashBookLedger.create]
    G6a -->|missing| G8[Throw Error: Missing Opening/Closing Balance]

    %% Credit Payment Flow
    H --> H1[Create Purchase Record credit]
    H1 --> H2{Any Damaged Units?}
    H2 -->|yes| H3[Record Damage tx.purchaseDamage.create]
    H2 -->|no| H4[Skip Damage Recording]
    H3 --> H5[Create Batch Inventory]
    H4 --> H5[Create Batch Inventory]

    H5 --> H6[Create Payable tx.batchPayables.create]

    %% Final Return
    G7 --> R[Return Success JSON]
    H6 --> R
    Z --> X[Return Error]

    %% style A fill:#,stroke:#444,stroke-width:1px
    %% style G fill:#ccf,stroke:#333
    %% style H fill:#cfc,stroke:#333
    %% style Z fill:#faa,stroke:#333
