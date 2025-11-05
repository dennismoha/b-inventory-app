Batch payables.
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

model Purchase {
  purchase_id            String        @id @default(uuid()) @db.Uuid
  batch                  String        @unique
  supplier_products_id   String        @db.Uuid
  quantity               Int
  damaged_units          Int
  reason_for_damage      String?
  undamaged_units        Int
  unit_id                String        @db.Uuid
  purchase_cost_per_unit Decimal       @db.Decimal(10, 2)
  total_purchase_cost    Decimal       @db.Decimal(12, 2)
  discounts              Decimal       @db.Decimal(10, 2)
  tax                    Decimal       @db.Decimal(10, 2)
  payment_type           PaymentType
  payment_method         PaymentMethod
  payment_status         PaymentStatus
  payment_date           DateTime?
  account_id             String?       @db.Uuid // Nullable if not paid via account
  payment_reference      String?
  arrival_date           DateTime
  created_at             DateTime      @default(now())
  updated_at             DateTime      @updatedAt

enum PaymentType {
  full
  partial
  credit
}


 We will have specific methods for handling updates in payment types from credit to full payment type to partials etc

How to update from credit to full payment type.

when updating from credit to full payment type , on our frontend ui we have the capacity on edit payment type to switch between the two.

Now payload will come in the form of 'full' payment mode:  batch: data.batch,
        supplier_products_id: data.supplier_products_id,
        quantity: data.quantity,
        damaged_units: data.damaged_units,
        reason_for_damage: data.reason_for_damage ?? null,
        undamaged_units,
        unit_id: data.unit_id,
        purchase_cost_per_unit: data.purchase_cost_per_unit,
        total_purchase_cost: data.total_purchase_cost,
        discounts: data.discounts,
        tax: data.tax,
        payment_type: 'full',
        payment_method: data.payment_method as PaymentMethod,
        payment_status: 'paid',
        payment_date: new Date(),
        account_id: data.account_id,
        payment_reference: data.payment_reference ?? null,
        arrival_date: data.arrival_date

now, once it reaches our backend we need to have a switch case for payment_type.

switch(payment_type) {
  case 'credit':
    // Handle credit payment type logic

    break;
  case 'full':
    // this will be called when the payment type is 'full'. this means we are updating from credit to full payment type.
    - reache the db and fetch  the existing purchase record.
    const existingPurchase = await tx.purchase.findUnique({
      where: { id: data.id },
    });

    if (!existingPurchase) {
      throw new Error('Purchase record not found');
    }
    - then we check the payment_type. if 'full' we throw an error because we cannot update from full to full. badReqest error.
    - if not then I'll take put the payment_type of that existing to a variable called oldPaymentType.
    - then both will be passed to a new method called handlePaymentTypeUpdate.
    - in here we will have another switch case to handle the logic for updating payment types. switch(oldPaymentType) 
    - so thing is if the oldPaymentType is 'credit',  we will have an if else to check if the new payment type is 'full' or 'partial'.
    - for this case since it's full  we will pass that to the method handleFullPaymentTypeUpdate. that will take care of the logic for updating from credit to full payment type.
    - This will include updating the payment status, payment date, and any other relevant fields in the purchase record.
    - if the oldPaymentType is 'partial', we will have another method called handlePartialPaymentTypeUpdate. that will take care of the logic for updating from partial to full payment type.
    - this will include updating the payment status, payment date, and any other relevant fields in the purchase record.
    - finally we will return a success message with the updated purchase record.

    // Handle full payment type logic
    break;
  default:
    throw new Error('Invalid payment type');
}

now logic for updating the payment type from credit to full payment type.
- go to the BatchPayables and set payment_type to 'full'.
- update the total_paid to the amount_due.
- update the balance_due to 0.
- update the payment_status to 'paid'.
- update the payment_date to the current date.
- update the settlement_date to the current date.

- Then go to the purchase record and update the payment_type to 'full' where purchase_id === purchaseId.
- update the payment_status to 'paid'.
- update the payment_date to the current date.
- update the account_id to the account_id of the batch payables.
- update the payment_reference to the payment_reference of the batch payables.
- update the updated_at to the current date.
- return the updated purchase record.

- create a journal entry for the full payment.
- credit bank account and debit the inventory account

return success to the user.

Updating from full to credit.
- The switch case will be the same as above.
- when the payment type is 'credit', we will have a method called handleCreditPaymentTypeUpdate.
- this will take care of the logic for updating from full to credit payment type.
handleCreditPaymentTypeUpdate will do the following:
 - Two scenarios exist. one is the purchase was initially in credit, updated to full, and now we are updating back to credit.
 - The other is the purchase was initially in full, and now we are updating to credit.

  scenario one:
 - go to the purchase and edit the following fields:
   - payment_type to 'credit'.
   - payment_status to 'unpaid'.
   - payment_date to null.
   - account_id to null.
   - payment_reference to null.
   - updated_at to the current date.

 - go to the BatchPayables and set payment_type to 'credit'.
    - update the total_paid to 0.
    - update the balance_due to the amount_due.
    - update the payment_status to 'unpaid'.
    - update the payment_date to null.

- create a journal entry for the credit payment.
- debit bank account and credit the inventory account.
- return success to the user.

scenario two:
- go to the purchase and edit the following fields:
  - payment_type to 'credit'.
  - payment_status to 'unpaid'.
  - payment_date to null.
  - account_id to null.
  - payment_reference to null.
  - updated_at to the current date.
- go to the BatchPayables and set payment_type to 'credit'.
- update the total_paid to 0.
- update the balance_due to the amount_due.
- update the payment_status to 'unpaid'.
- update the payment_date to null.
- create a journal entry for the credit payment.
- debit bank account and credit the inventory account.
- return success to the user.