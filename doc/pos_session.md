# pos session life cycle

sequenceDiagram
  participant POS
  participant Server
  participant DB

  POS->>Server: Open POS Session
  Server->>DB: Set opening_balance = previous running_balance
  Server->>DB: Set running_balance = opening_balance

  loop During Session
    POS->>Server: Perform Transaction
    Server->>DB: Log to AccountsLog & CashBookLedger
    Server->>DB: Update running_balance
  end

  POS->>Server: Close POS Session
  Server->>DB: Snapshot Account balances
  Server->>DB: Create AccountBalanceSnapshot
  Server->>DB: Create AccountCollection
  Server->>DB: Create AccountSessionLog
