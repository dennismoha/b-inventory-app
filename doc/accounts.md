# Account feature.

## create account.

flowchart TD
  A[User submits request to createAccount] --> B[Validate input with Joi schema]
  B --> C[Check if account_number already exists]
  C -->|Exists| X[Throw ConflictError]
  C -->|Does not exist| D[Prepare opening_balance and running_balance]
  D --> E[Create Account in database]
  E --> F[Log account creation in AccountStatusLog table]

  subgraph Tables
    Account[Account Table]
    AccountStatusLog[AccountStatusLog Table]
  end

  E --> Account
  F --> AccountStatusLog




### ERD DIAGRAM

    classDiagram
        class Account {
            +String account_id
            +String name
            +String account_number
            +AccountType type
            +String description
            +Decimal opening_balance
            +Decimal running_balance
            +Boolean deleted
            +AccountStatus account_status
            +DateTime created_at
            +DateTime updated_at
            --
            +createAccount()
            +updateAccountDetails()
            +changeStatus(newStatus)
            +debit(amount)
            +credit(amount)
            +resetForSession(openingBalance)
        }

    class AccountsLog {
        +String accounts_log_id
        +String account_id
        +String action
        +Decimal opening_balance
        +Decimal running_balance
        +Decimal new_balance
        +String pos_session_id
        +String user
        +DateTime created_at
        --
        +recordEntry(account, action, amount, session, user)
    }

    class CashBookLedger {
        +String ledger_id
        +String opening_closing_balance_id
        +DateTime transaction_date
        +TransactionType transaction_type
        +Decimal amount
        +PaymentMethod method
        +ReferenceType reference_type
        +String reference_id
        +Decimal balance_after
        +String description
        +DateTime created_at
        +DateTime updated_at
        +String account_id
        --
        +recordTransaction(account, type, amount, method, reference)
    }

    class AccountStatusLog {
        +String id
        +String account_id
        +String old_status
        +String new_status
        +String changed_by
        +DateTime changed_at
        --
        +logStatusChange(account, oldStatus, newStatus, user)
    }

    class AccountCollection {
        +String collection_id
        +DateTime snapshot_date
        +DateTime created_at
        +DateTime updated_at
        --
        +createCollection(session)
    }

    class AccountBalanceSnapshot {
        +String snapshot_id
        +String account_id
        +Decimal opening_balance
        +Decimal closing_balance
        --
        +takeSnapshot(account, session)
    }

    class AccountSessionLog {
        +String id
        +String account_id
        +Decimal opening_balance
        +Decimal closing_balance
        +String pos_session
        +String user
        +DateTime created_at
        --
        +logSession(account, opening, closing, session, user)
    }

    %% Relations
    Account "1" -- "many" AccountsLog : logs
    Account "1" -- "many" CashBookLedger : transactions
    Account "1" -- "many" AccountStatusLog : status_history
    Account "1" -- "many" AccountBalanceSnapshot : snapshots
    AccountCollection "1" -- "many" AccountBalanceSnapshot : contains
    AccountCollection "1" -- "many" AccountSessionLog : contains


## SEQUENCE DIAGRAM:

    sequenceDiagram
    participant User as User (Cashier)
    participant Account as Account
    participant Log as AccountsLog
    participant Ledger as CashBookLedger
    participant Session as POS Session
    participant Snapshot as AccountSnapshot/Collection

    %% Session Open
    User->>Session: Open POS Session
    Session->>Account: Set opening_balance = last closing_balance
    Session->>Account: Set running_balance = opening_balance

    %% During Day: Sale
    User->>Account: Record Sale ($200)
    Account->>Account: running_balance = running_balance + 200
    Account->>Log: Save debit action (old + new balance)
    Account->>Ledger: Save inflow (SALE, amount = 200)

    %% During Day: Purchase
    User->>Account: Make Purchase ($300)
    alt Enough Balance
        Account->>Account: running_balance = running_balance - 300
        Account->>Log: Save credit action (old + new balance)
        Account->>Ledger: Save outflow (PURCHASE_PAYMENT, amount = 300)
    else Insufficient Balance
        Account-->>User: ❌ Deny transaction (not enough funds)
    end

    %% Session Close
    User->>Session: Close POS Session
    Session->>Snapshot: Create AccountCollection
    Session->>Snapshot: Save AccountBalanceSnapshot (per account)
    Session->>Snapshot: Save AccountSessionLog
    Snapshot->>Account: Closing balance = running_balance
    Snapshot-->>Session: Ready for next opening_balance

## ENDPOINTS SEQUENCE DIAGRAM

sequenceDiagram

    participant User as User (Cashier/API Caller)
    participant API as Accounts API
    participant Account as Account
    participant Log as AccountsLog
    participant Ledger as CashBookLedger
    participant StatusLog as AccountStatusLog
    participant Session as POS Session
    participant Snapshot as AccountSnapshot/Collection

    %% Account Management
    User->>API: GET /accounts
    API->>Account: Fetch all (where status != CLOSED)

    User->>API: POST /accounts
    API->>Account: Create new (set opening + running balance)

    User->>API: PUT /accounts/update
    API->>Account: Update details

    User->>API: PUT /accounts/status (ACTIVE/INACTIVE/CLOSED)
    API->>Account: Change account_status
    API->>StatusLog: Record status change

    User->>API: DELETE /accounts
    API->>Account: Set deleted = true

    %% Transactions
    User->>API: POST /accounts/transaction (debit/credit)
    API->>Account: Update running_balance
    alt Debit (inflow)
        Account->>Log: Save debit entry
        Account->>Ledger: Save inflow
    else Credit (outflow)
        alt Enough Balance
            Account->>Log: Save credit entry
            Account->>Ledger: Save outflow
        else Insufficient Balance
            API-->>User: ❌ Deny transaction
        end
    end

    %% Session Lifecycle
    User->>API: POST /pos_session/open
    API->>Account: Reset opening & running balances

    User->>API: POST /pos_session/close
    API->>Snapshot: Create AccountCollection
    API->>Snapshot: Create AccountBalanceSnapshot (per account)
    API->>Snapshot: Create AccountSessionLog
    Snapshot->>Account: Closing balance stored











# Accounting system


flowchart TD
  subgraph AccountManagement
    A1[Account] -->|has many| ALog[Accounts Log]
    A1 -->|has many| CB[CashBookLedger]
    A1 -->|has many| ASLog[AccountStatusLog]
    A1 -->|has many| ABSnap[AccountBalanceSnapshot]
    A1 -->|belongs to| ACColl[AccountCollection]
  end

  subgraph SessionManagement
    POS_OPEN[POS Session Open] -->|sets| OpeningBal[Account.opening_balance = previous running_balance]
    POS_CLOSE[POS Session Close] -->|triggers| ACCollCreate[Create AccountCollection]
    ACCollCreate -->|creates| ABSnapShot[AccountBalanceSnapshot]
    ABSnapShot -->|logs| SessionLog[AccountSessionLog]
  end

  subgraph Transactions
    Trans[Transaction] -->|affects| CB
    Trans -->|affects| ALog
    Trans -->|updates| A1
    CB -->|records| Balance[balance_after]
  end

  A1 -->|status change| ASLog
  POS_CLOSE -->|reads| RunningBalance[Account.running_balance]
  RunningBalance -->|summed| ClosingBalance[Total Closing Balance]

  style A1 fill:#f9f,stroke:#333,stroke-width:1px
  style Trans fill:#bbf,stroke:#333,stroke-width:1px
  style POS_OPEN fill:#bfb,stroke:#333,stroke-width:1px
  style POS_CLOSE fill:#bfb,stroke:#333,stroke-width:1px



# main structure.

sequenceDiagram
    participant User as User (Cashier/API Caller)
    participant API as Accounts API
    participant Account as Account
    participant Log as AccountsLog
    participant Ledger as CashBookLedger
    participant StatusLog as AccountStatusLog
    participant Session as POS Session
    participant Snapshot as AccountSnapshot/Collection

    %% Account Management
    User->>API: GET /accounts
    API->>Account: Fetch all (where status != CLOSED)

    User->>API: POST /accounts
    API->>Account: Create new (set opening + running balance)

    User->>API: PUT /accounts/update
    API->>Account: Update details

    User->>API: PUT /accounts/status (ACTIVE/INACTIVE/CLOSED)
    API->>Account: Change account_status
    API->>StatusLog: Record status change

    User->>API: DELETE /accounts
    API->>Account: Set deleted = true

    %% Transactions
    User->>API: POST /accounts/transaction (debit/credit)
    API->>Account: Update running_balance
    alt Debit (inflow)
        Account->>Log: Save debit entry
        Account->>Ledger: Save inflow
    else Credit (outflow)
        alt Enough Balance
            Account->>Log: Save credit entry
            Account->>Ledger: Save outflow
        else Insufficient Balance
            API-->>User: ❌ Deny transaction
        end
    end

    %% Session Lifecycle
    User->>API: POST /pos_session/open
    API->>Account: Reset opening & running balances

    User->>API: POST /pos_session/close
    API->>Snapshot: Create AccountCollection
    API->>Snapshot: Create AccountBalanceSnapshot (per account)
    API->>Snapshot: Create AccountSessionLog
    Snapshot->>Account: Closing balance stored



sequenceDiagram
    participant User as User (Cashier)
    participant Account as Account
    participant Log as AccountsLog
    participant Ledger as CashBookLedger
    participant Session as POS Session
    participant Snapshot as AccountSnapshot/Collection

    %% Session Open
    User->>Session: Open POS Session
    Session->>Account: Set opening_balance = last closing_balance
    Session->>Account: Set running_balance = opening_balance

    %% During Day: Sale
    User->>Account: Record Sale ($200)
    Account->>Account: running_balance = running_balance + 200
    Account->>Log: Save debit action (old + new balance)
    Account->>Ledger: Save inflow (SALE, amount = 200)

    %% During Day: Purchase
    User->>Account: Make Purchase ($300)
    alt Enough Balance
        Account->>Account: running_balance = running_balance - 300
        Account->>Log: Save credit action (old + new balance)
        Account->>Ledger: Save outflow (PURCHASE_PAYMENT, amount = 300)
    else Insufficient Balance
        Account-->>User: ❌ Deny transaction (not enough funds)
    end

    %% Session Close
    User->>Session: Close POS Session
    Session->>Snapshot: Create AccountCollection
    Session->>Snapshot: Save AccountBalanceSnapshot (per account)
    Session->>Snapshot: Save AccountSessionLog
    Snapshot->>Account: Closing balance = running_balance
    Snapshot-->>Session: Ready for next opening_balance



