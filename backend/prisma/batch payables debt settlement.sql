batch payables debt
model BatchPayables {
  payable_id      String        @id @default(uuid()) @db.Uuid
  purchase_id     String        @unique @db.Uuid
  amount_due      Decimal       @db.Decimal(12, 2)
  total_paid      Decimal       @default(0.00) @db.Decimal(12, 2) // Total amount paid so far
  status          PayableStatus
  payment_type    PaymentType
  balance_due     Decimal       @default(0.00) @db.Decimal(12, 2) // Remaining balance if partially paid
  settlement_date DateTime?
  created_at      DateTime      @default(now())
  updated_at      DateTime      @updatedAt

  batchpayable Purchase @relation(fields: [purchase_id], references: [purchase_id])

  @@map("BatchPayables")
}

ui:
will add a modal button for payments. this modal button will be triggered only for those balance_due > 0.
we can try use the journals to fetch previous records of payments. 
Now,once a payment is done we increase the total_paid, reduce the balance.

- Now , incase during payments amount sent > balane we throw an error. 

if amount_due = total_paid then balance has to be zero and in that case we should update both the status on purchase as 'paid' 
 
 process:
- User clicks on "Pay" button for a batch payable with balance due > 0.
- A modal opens with payment details.
- User enters payment amount and selects payment type.
- On submission, the payment is processed:
  - If payment amount > balance due, throw an error.
  - If payment amount <= balance due:
    - Update `total_paid` by adding the payment amount.
    - Update `balance_due` by subtracting the payment amount.
    - If `balance_due` becomes 0, update the status to 'PAID'. update the purchase status to 'PAID' as well.
- A journal entry is created to record the payment transaction for each transaction. we debit the bank account and credit the payable account.
return success to the user with updated details.
