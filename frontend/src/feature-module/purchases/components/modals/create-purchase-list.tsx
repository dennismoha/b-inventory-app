import type { Account, Unit } from '@features/interface/features-interface';
import CommonDatePicker from '@components/date-picker/common-date-picker';
import CommonSelect from '@components/select/common-select';
import { useCreatePurchaseMutation } from '@core/redux/api/inventory-api';

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// export interface Account {
//   account_id: string;
//   name: string;
//   account_number?: string | null;
//   type: 'cash' | 'bank' | 'credit_card' | 'other';
//   description?: string | null;
//   balance: string; // Prisma Decimal handled as string
//   current_balance: string;
//   deleted: boolean;
//   account_status: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
//   created_at: Date;
//   updated_at: Date;
// }

export interface PurchasePayload {
  batch: string;
  supplier_products_id: string;
  quantity: number;
  damaged_units: number;
  unit_id: string;
  purchase_cost_per_unit: number;
  total_purchase_cost: number;
  discounts: number;
  tax: number;
  payment_type: string;
  payment_method: string;
  account_id: string;
  payment_reference: string;
  arrival_date: Date | null;
}

export interface DeletePurchasePayload {
  purchase_id: string;
  batch: string;
}

interface CreatePurchaseListProps {
  supplierOptions: { label: string; value: string }[];
  Accounts: Account[] | [];
  unitsData: Unit[];
}

const CreatePurchaseListModal: React.FC<CreatePurchaseListProps> = ({ supplierOptions, Accounts, unitsData }) => {
  const activeAccounts = Accounts.filter((a) => a.account_status === 'ACTIVE' && a.name === 'Bank');
  const [createPurchase, { isSuccess, isError, error, reset }] = useCreatePurchaseMutation();

  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [date, setDate] = useState<Date | null>(new Date());

  // units
  const [unitId, setUnitId] = useState<string>('');

  // full
  const [reference, setReference] = useState<string>('');

  const [paymentType, setPaymentType] = useState('full'); // default full
  const [totalCost, setTotalCost] = useState<number>(0);
  const [initialPayment, setInitialPayment] = useState<number>(0);
  const [selectedAccount, setSelectedAccount] = useState<string>(''); // full/partial account
  const [splitPayments, setSplitPayments] = useState([
    { account: '', amount: 0, date: new Date().toISOString().slice(0, 10), reference: '' }
  ]);
  // Basic fields
  const [batch, setBatch] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [damagedUnits, setDamagedUnits] = useState<number>(0);
  const [purchaseCostPerUnit, setPurchaseCostPerUnit] = useState<number>(0);
  const [discounts, setDiscounts] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);

  //   console.log('>>>>>>>>>>>>>>>>>>>> unitsData', unitsData);

  const resetForm = () => {
    setSelectedSupplier('');
    setDate(new Date());
    setUnitId('');
    setReference('');
    setPaymentType('full');
    setTotalCost(0);
    setInitialPayment(0);
    setSelectedAccount('');
    setSplitPayments([{ account: '', amount: 0, date: new Date().toISOString().slice(0, 10), reference: '' }]);
    setBatch('');
    setQuantity(0);
    setDamagedUnits(0);
    setPurchaseCostPerUnit(0);
    setDiscounts(0);
    setTax(0);
  };
  const paymentTypeOptions = [
    { label: 'Full', value: 'full' },
    { label: 'Partial', value: 'partial' },
    { label: 'Credit', value: 'credit' },
    { label: 'Full Split', value: 'full_split' }
  ];

  // Handle add/remove split payments
  const addSplitPayment = () => {
    setSplitPayments([...splitPayments, { account: '', amount: 0, date: new Date().toISOString().slice(0, 10), reference: '' }]);
  };

  const removeSplitPayment = (index: number) => {
    setSplitPayments(splitPayments.filter((_, i) => i !== index));
  };

  type SplitPaymentField = 'account' | 'amount' | 'date' | 'reference';
  const updateSplitPayment = (index: number, field: SplitPaymentField, value: string | number) => {
    const updated = [...splitPayments];
    updated[index][field] = value as never;
    setSplitPayments(updated);
  };

  // Validate split payments
  const validateSplitPayments = (): string[] => {
    const errors: string[] = [];
    const totalSplit = splitPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    if (totalSplit !== totalCost) {
      errors.push('Total split payments do not match the full amount!');
    }

    splitPayments.forEach((p, i) => {
      if (!p.account || p.amount <= 0) {
        errors.push(`Split entry ${i + 1} is incomplete!`);
      } else {
        const account = activeAccounts.find((a) => a.account_id === p.account);
        if (account && Number(p.amount) > Number(account.current_balance)) {
          errors.push(`Split entry ${i + 1}: Amount exceeds available balance in ${account.name}.`);
        }
      }
    });

    return errors;
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reset();

    let paymentStatus: string = 'unpaid';
    let errors: string[] = [];

    // FULL
    if (paymentType === 'full') {
      if (!selectedAccount) errors.push('Please select an account.');
      const account = activeAccounts.find((a) => a.account_id === selectedAccount);
      if (account && totalCost > Number(account.current_balance)) {
        errors.push('Total cost cannot be greater than account balance.');
      }
      paymentStatus = 'paid';
    }

    // PARTIAL
    if (paymentType === 'partial') {
      if (!selectedAccount) errors.push('Please select an account.');
      if (initialPayment <= 0) errors.push('Initial payment must be greater than 0.');
      if (initialPayment > totalCost) errors.push('Initial payment cannot exceed total cost.');

      const account = activeAccounts.find((a) => a.account_id === selectedAccount);
      if (account && totalCost > Number(account.current_balance)) {
        errors.push('Total cost cannot be greater than account balance.');
      }
      paymentStatus = initialPayment < totalCost ? 'partially_paid' : 'paid';
    }

    // CREDIT
    if (paymentType === 'credit') {
      paymentStatus = 'unpaid';
    }

    // SPLIT
    if (paymentType === 'full_split') {
      errors = validateSplitPayments();
      paymentStatus = errors.length === 0 ? 'paid' : 'unpaid';
      console.log('Validated split payments with errors:', paymentStatus);
    }

    console.log('errors legnth are ', errors.length);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    const payload = {
      batch: batch,
      supplier_products_id: selectedSupplier,
      quantity,
      damaged_units: damagedUnits,
      unit_id: unitId,
      purchase_cost_per_unit: purchaseCostPerUnit,
      total_purchase_cost: totalCost,
      discounts,
      tax,
      payment_type: paymentType,
      payment_method: 'BANK',
      account_id: selectedAccount,
      payment_reference: reference,
      arrival_date: date

      //   reference: reference
      //   total_cost: totalCost,
      //   payment_type: paymentType,
      //   payment_status: paymentStatus,
      //   ...(paymentType === 'partial' && { initial_payment: initialPayment, account_id: selectedAccount }),
      //   ...(paymentType === 'full' && { account_id: selectedAccount }),
      //   ...(paymentType === 'full_split' && { split_payments: splitPayments })
    };
    createPurchase(payload);
    console.log('Form Submitted:', payload);
    // send payload to backend here
  };

  const handleDamagedUnitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty string (so backspace works normally)
    if (value === '') {
      setDamagedUnits(0);
      return;
    }

    // Allow only digits
    if (/^\d+$/.test(value)) {
      setDamagedUnits(Number(value));
    } else {
      alert('Only numbers accepted');
    }
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<number>>) => {
    const value = e.target.value.trim();

    if (value === '') {
      setter(0);
      return;
    }

    if (/^\d+$/.test(value)) {
      setter(Number(value));
    } else {
      alert('Only numbers accepted');
    }
  };

  useEffect(() => {
    const modal = document.getElementById('add-purchase');
    console.log('Closing Modal element:');
    if (!modal) return;

    // const handleHidden = () => resetForm();
    const handleHidden = () => {
      console.log('Purchase Modal Hidden - resetting form');
      resetForm();
      reset(); // clears RTK mutation flags
    };

    modal.addEventListener('hidden.bs.modal', handleHidden);
    return () => {
      modal.removeEventListener('hidden.bs.modal', handleHidden);
      reset();
    };
  }, []);

  return (
    <div className="modal fade" id="add-purchase">
      <div className="modal-dialog purchase modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <div className="page-title">
              <h4>Add Purchase</h4>
            </div>
            <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>

          {/*  FORM */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                {/* Supplier Name */}
                <div className="col-lg-4 col-md-6 col-sm-12">
                  <div className="mb-3 add-product">
                    <label className="form-label">
                      Supplier Products<span className="text-danger ms-1">*</span>
                    </label>
                    <div className="row">
                      <div className="col-lg-10 col-sm-10 col-10">
                        <CommonSelect
                          className="w-100"
                          options={supplierOptions}
                          value={selectedSupplier}
                          //  onChange={(e) => setSelectedSupplier(e.target.value)}
                          onChange={(option) => setSelectedSupplier(option.value)}
                          placeholder="Select Supplier"
                          filter={false}
                        />
                      </div>
                      <div className="col-lg-2 col-sm-2 col-2 ps-0">
                        <div className="add-icon tab">
                          <Link to="#" data-bs-toggle="modal" data-bs-target="#add_customer">
                            <i className="feather icon-plus-circle" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrival Date */}
                <div className="col-lg-4 col-md-6 col-sm-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Arrival Date<span className="text-danger ms-1">*</span>
                    </label>
                    <div className="input-groupicon calender-input">
                      <i className="feather icon-plus-calendar info-img" />
                      <CommonDatePicker appendTo={'self'} value={date} onChange={setDate} className="w-100" />
                    </div>
                  </div>
                </div>

                {/* Reference */}
                {/* <div className="col-lg-4 col-sm-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Reference<span className="text-danger ms-1">*</span>
                    </label>
                    <input type="text" className="form-control" name="payment_reference" placeholder="INV-XXXX-XXX" />
                  </div>
                </div> */}
              </div>
              {/* Batch + Supplier Product */}
              <div className="row">
                <div className="col-lg-6 col-sm-12">
                  <div className="mb-3">
                    <label className="form-label">Batch</label>
                    <input
                      type="text"
                      className="form-control"
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      name="batch"
                      placeholder="BATCH-2025-XXX"
                    />
                  </div>
                </div>
                {/* <div className="col-lg-6 col-sm-12">
                  <div className="mb-3">
                    <label className="form-label">Supplier Product ID</label>
                    <input type="text" className="form-control" name="supplier_products_id" />
                  </div>
                </div> */}
              </div>
              {/* Quantity + Damaged Units */}
              <div className="row">
                <div className="col-lg-4 col-sm-12">
                  <div className="mb-3">
                    <label className="form-label">Quantity</label>
                    <input
                      type="text"
                      className="form-control"
                      name="quantity"
                      value={quantity}
                      // onChange={(e) => (!Number(e.target.value) ? alert('only numbers accepted') : setQuantity(Number(e.target.value)))}
                      onChange={(e) => handleNumericChange(e, setQuantity)}
                    />
                  </div>
                </div>
                <div className="col-lg-4 col-sm-12">
                  <div className="mb-3">
                    <label className="form-label">Damaged Units</label>
                    <input
                      type="text"
                      className="form-control"
                      value={damagedUnits}
                      // onChange={(e) => (!Number(e.target.value) ? alert('only numbers accepted') : setDamagedUnits(Number(e.target.value)))}
                      onChange={(e) => handleDamagedUnitsChange(e)}
                      name="damaged_units"
                    />
                  </div>
                </div>
                <div className="col-lg-4 col-sm-12">
                  <div className="mb-3">
                    <label className="form-label">Unit ID</label>
                    <select className="form-control" value={unitId} onChange={(e) => setUnitId(e.target.value)}>
                      <option value="">Select Units</option>
                      {JSON.stringify(unitsData)}
                      {unitsData.map((unit) => (
                        <option key={unit.unit_id} value={unit.unit_id}>
                          {unit.short_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {/* Pricing */}
              <div className="row">
                <div className="col-lg-3 col-sm-12">
                  <div className="mb-3">
                    <label className="form-label">Purchase Cost per Unit</label>
                    <input
                      type="text"
                      className="form-control"
                      value={purchaseCostPerUnit}
                      // onChange={(e) =>
                      //   !Number(e.target.value) ? alert('only numbers accepted') : setPurchaseCostPerUnit(Number(e.target.value))
                      // }
                      onChange={(e) => handleNumericChange(e, setPurchaseCostPerUnit)}
                      name="purchase_cost_per_unit"
                    />
                  </div>
                </div>
                {/* <div className="col-lg-3 col-sm-12">
                  <div className="mb-3">
                    <label className="form-label">Total Purchase Cost</label>
                    <input type="number" step="0.01" className="form-control" name="total_purchase_cost" />
                  </div>
                </div> */}
                <div className="col-lg-3 col-sm-12">
                  <div className="mb-3">
                    <label className="form-label">Discounts</label>
                    <input
                      type="text"
                      className="form-control"
                      value={discounts}
                      // onChange={(e) => (!Number(e.target.value) ? alert('only numbers accepted') : setDiscounts(Number(e.target.value)))}
                      onChange={(e) => handleNumericChange(e, setDiscounts)}
                      name="discounts"
                    />
                  </div>
                </div>
                <div className="col-lg-3 col-sm-12">
                  <div className="mb-3">
                    <label className="form-label">Tax</label>
                    <input
                      type="text"
                      className="form-control"
                      value={tax}
                      // onChange={(e) => (!Number(e.target.value) ? alert('only numbers accepted') : setTax(Number(e.target.value)))}
                      onChange={(e) => handleNumericChange(e, setTax)}
                      name="tax"
                    />
                  </div>
                </div>
              </div>
              {/* Payment Type */}
              <div className="row">
                <div className="col-lg-4 col-sm-12">
                  <div className="mb-3">
                    <label className="form-label">Payment Type</label>
                    <select className="form-control" value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                      {paymentTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {/* FULL */}
              {paymentType === 'full' && (
                <div className="row">
                  <div className="col-lg-4">
                    <label>Total Purchase Cost</label>
                    <input
                      type="text"
                      className="form-control"
                      value={totalCost}
                      // onChange={(e) => (!Number(e.target.value) ? alert('only numbers accepted') : setTotalCost(Number(e.target.value)))}
                      onChange={(e) => handleNumericChange(e, setTotalCost)}
                    />
                  </div>
                  <div className="col-lg-4">
                    <label>Account</label>
                    <select className="form-control" value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
                      <option value="">Select Account</option>
                      {activeAccounts.map((acc) => (
                        <option key={acc.account_id} value={acc.account_id}>
                          {acc.name} (Bal: {acc.running_balance})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3 col-lg-4">
                    <label className="form-label">Payment Reference</label>
                    <input
                      type="text"
                      className="form-control"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="e.g. MPESA TXN ID, Bank Ref..."
                    />
                  </div>
                </div>
              )}
              {/* PARTIAL */}
              {paymentType === 'partial' && (
                <div className="row">
                  <div className="col-lg-4">
                    <label>Total Purchase Cost</label>
                    <input
                      type="text"
                      className="form-control"
                      value={totalCost}
                      // onChange={(e) => setTotalCost(Number(e.target.value))}
                      onChange={(e) => handleNumericChange(e, setTotalCost)}
                    />
                  </div>
                  <div className="col-lg-4">
                    <label>Initial Payment</label>
                    <input
                      type="number"
                      className="form-control"
                      value={initialPayment}
                      // onChange={(e) => setInitialPayment(Number(e.target.value))}
                      onChange={(e) => handleNumericChange(e, setInitialPayment)}
                    />
                  </div>
                  <div className="col-lg-4">
                    <label>Account</label>
                    <select className="form-control" value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
                      <option value="">Select Account</option>
                      {activeAccounts.map((acc) => (
                        <option key={acc.account_id} value={acc.account_id}>
                          {acc.name} (Bal: {acc.current_balance})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3 col-lg-4">
                    <label className="form-label">Payment Reference</label>
                    <input
                      type="text"
                      className="form-control"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="e.g. MPESA TXN ID, Bank Ref..."
                    />
                  </div>
                  <div className="col-lg-4 mt-2">
                    <label>Remaining Balance</label>
                    <input type="text" className="form-control" value={Math.max(totalCost - initialPayment, 0)} readOnly />
                  </div>
                </div>
              )}
              {/* CREDIT */}
              {paymentType === 'credit' && (
                <div className="row">
                  <div className="col-lg-4">
                    <label>Credit Amount</label>
                    <input type="text" className="form-control" value={totalCost} onChange={(e) => setTotalCost(Number(e.target.value))} />
                  </div>
                </div>
              )}
              {/* SPLIT */}
              {paymentType === 'full_split' && (
                <>
                  <div className="row">
                    <div className="col-lg-4">
                      <label>Total Cost</label>
                      <input
                        type="text"
                        className="form-control"
                        value={totalCost}
                        // onChange={(e) => setTotalCost(Number(e.target.value))}
                        onChange={(e) => handleNumericChange(e, setTotalCost)}
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label>Split Payments</label>
                    {splitPayments.map((p, index) => {
                      const account = activeAccounts.find((a) => a.account_id === p.account);
                      return (
                        <div key={index} className="d-flex align-items-center gap-2 mb-2">
                          <select
                            className="form-control"
                            value={p.account}
                            onChange={(e) => updateSplitPayment(index, 'account', e.target.value)}
                          >
                            <option value="">Select Account</option>
                            {activeAccounts.map((acc) => (
                              <option key={acc.account_id} value={acc.account_id}>
                                {acc.name} (Bal: {acc.current_balance})
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Amount"
                            value={p.amount}
                            onChange={(e) => updateSplitPayment(index, 'amount', Number(e.target.value))}
                          />
                          <input
                            type="date"
                            className="form-control"
                            value={p.date}
                            onChange={(e) => updateSplitPayment(index, 'date', e.target.value)}
                          />
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Reference"
                            value={p.reference}
                            onChange={(e) => updateSplitPayment(index, 'reference', e.target.value)}
                          />
                          {account && p.amount > Number(account.current_balance) && (
                            <span className="text-danger small">Exceeds Balance!</span>
                          )}
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => removeSplitPayment(index)}>
                            X
                          </button>
                        </div>
                      );
                    })}
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addSplitPayment}>
                      + Add Split
                    </button>
                  </div>
                </>
              )}
              {/* Description */}{' '}
              <div className="col-lg-12 mt-3">
                {' '}
                {isSuccess && <div className="alert alert-success">Purchase created successfully!</div>}
                {isError && <div className="alert alert-danger">Error creating purchase: {error.message}</div>}
                {/* <div className="mb-3 summer-description-box">
                  <label className="form-label">Description</label>
                  <div id="summernote" />
                  <p className="mt-1">Maximum 60 Words</p>{' '}
                </div>{' '} */}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn me-2 btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePurchaseListModal;

/**
 * now, on the UI
 * enum PaymentType {
        full
        partial
        credit
        full_split
    }

enum PaymentStatus {
  paid
  unpaid
  partially_paid
}

Default Payment Type:
        By default, the payment type will be full.
        The user should input only the total_purchase_cost.
        The payment status will be updated to paid.

Partial Payment Type:
    When the user selects partial payment:
    Show fields for the total_purchase_cost and initial payment amount.
    Automatically calculate and display the remaining balance.

Credit Payment Type:
        If the user selects credit as the payment type:
        Allow the user to input the total cost (credit amount).

split Payments.
        Input Fields for Split Payments:

        Show an initial input for the total cost (same as the total_purchase_cost).

        Below the total cost, display a button to add split payment entry.

        Each split payment entry will have:

        A dropdown to select an account (e.g., bank, cash, credit).
        An input field to enter the payment amount.
        Dynamic Add/Remove Inputs:

        When the user clicks the + button, a new split payment entry will appear with the same fields (account and amount).
        The user can remove any split payment entry by clicking an X next to the input.
        Automatically recalculate the sum of the amounts as the user adds or removes entries.
        Validation:

        Ensure the sum of the entered amounts equals the total cost. If it doesn’t match, show an error: Error: Total split payments do not match the full amount!.
        if money entered is greater than the amount in the respective account throw an error.
        Ensure no split payment is missing either the account or the payment amount. If missing, show an error: Error: Please provide the full payment details for each split payment entry!.
        Submit:

        The form should be submitted only if all the split payments are correctly entered and the total matches the total cost.

        
- Now we need to add an account. the account structure is as follows.
    export interface Account {
            account_id: string;
            name: string;
            account_number?: string | null;
            type: 'cash' | 'bank' | 'credit_card' | 'other';
            description?: string | null;
            balance: Decimal; // Prisma Decimal is best handled as string in TS
            current_balance: Decimal;
            deleted: boolean;
            account_status: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
            created_at: Date; // Date as ISO Date
            updated_at: Date;
}

we need to first filter with respect to account_status and return only those that are active. it's an Array of such structure.

Then now , if  PaymentType full selected, we neeed to select the account as well. this account will be in a select option input.
    Now if the account selected total_cost > current balance we throw an error. total_cost cannot be greater than the account current balance.

Then we also go to partial and do that . if total_cost is greater than account current balance we throw an error.

Then we go to split payments. We have to change the following to loop the accounts. now if any selected the account balance is less than the amount we throw an error.
all. maybe we can also add a field for dates for split payments. to show for each account when that payment was done. again, we also need to have a reference field for each. 
the reference field will be a text input that will hold any type of reference for payments eg message for payment. etc.

Then rest of the rules maintain. that's the only place we adjust . credit payment type account should not be shown.


    
 * 
 */

// const CreatePurchaseListModal = ({ supplierOptions }) => {
//   const [selectedSupplier, setSelectedSupplier] = useState('');
//   const [selectedStatus, setSelectedStatus] = useState('');
//   const [date, setDate] = useState<Date | null>(new Date());
//   const statusOptions = [
//     { label: 'Select', value: '' },
//     { label: 'Received', value: 'received' },
//     { label: 'Pending', value: 'pending' }
//   ];

//   return (
//     <div className="modal fade" id="add-purchase">
//       <div className="modal-dialog purchase modal-dialog-centered">
//         <div className="modal-content">
//           <div className="modal-header">
//             <div className="page-title">
//               <h4>Add Purchase</h4>
//             </div>
//             <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
//               <span aria-hidden="true">×</span>
//             </button>
//           </div>
//           <form action="purchase-list.html">
//             <div className="modal-body">
//               <div className="row">
//                 <div className="col-lg-4 col-md-6 col-sm-12">
//                   <div className="mb-3 add-product">
//                     <label className="form-label">
//                       Supplier Name<span className="text-danger ms-1">*</span>
//                     </label>
//                     <div className="row">
//                       <div className="col-lg-10 col-sm-10 col-10">
//                         <CommonSelect
//                           className="w-100"
//                           options={supplierOptions}
//                           value={selectedSupplier}
//                           onChange={(e) => setSelectedSupplier(e.value)}
//                           placeholder="Select Supplier"
//                           filter={false}
//                         />
//                       </div>
//                       <div className="col-lg-2 col-sm-2 col-2 ps-0">
//                         <div className="add-icon tab">
//                           <Link to="#" data-bs-toggle="modal" data-bs-target="#add_customer">
//                             <i className="feather icon-plus-circle" />
//                           </Link>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="col-lg-4 col-md-6 col-sm-12">
//                   <div className="mb-3">
//                     <label className="form-label">
//                       Date<span className="text-danger ms-1">*</span>
//                     </label>
//                     <div className="input-groupicon calender-input">
//                       <i className="feather icon-plus-calendar info-img" />
//                       <CommonDatePicker appendTo={'self'} value={date} onChange={setDate} className="w-100" />
//                     </div>
//                   </div>
//                 </div>
//                 <div className="col-lg-4 col-sm-12">
//                   <div className="mb-3">
//                     <label className="form-label">
//                       Reference<span className="text-danger ms-1">*</span>
//                     </label>
//                     <input type="text" className="form-control" />
//                   </div>
//                 </div>
//               </div>
//               <div className="row">
//                 <div className="col-lg-12">
//                   <div className="mb-3">
//                     <label className="form-label">
//                       Product<span className="text-danger ms-1">*</span>
//                     </label>
//                     <input type="text" className="form-control" placeholder="Search Product" />
//                   </div>
//                 </div>
//                 <div className="col-lg-12">
//                   <div className="modal-body-table mt-3">
//                     <div className="table-responsive">
//                       <table className="table datatable rounded-1">
//                         <thead>
//                           <tr>
//                             <th className="bg-secondary-transparent p-3">Product</th>
//                             <th className="bg-secondary-transparent p-3">Qty</th>
//                             <th className="bg-secondary-transparent p-3">Purchase Price($)</th>
//                             <th className="bg-secondary-transparent p-3">Discount($)</th>
//                             <th className="bg-secondary-transparent p-3">Tax(%)</th>
//                             <th className="bg-secondary-transparent p-3">Tax Amount($)</th>
//                             <th className="bg-secondary-transparent p-3">Unit Cost($)</th>
//                             <th className="bg-secondary-transparent p-3">Total Cost(%)</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           <tr>
//                             <td className="p-0" />
//                             <td className="p-0" />
//                             <td className="p-0" />
//                             <td className="p-0" />
//                             <td className="p-0" />
//                             <td className="p-0" />
//                             <td className="p-0" />
//                             <td className="p-0" />
//                           </tr>
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="row">
//                   <div className="col-lg-3 col-md-6 col-sm-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Order Tax<span className="text-danger ms-1">*</span>
//                       </label>
//                       <input type="text" className="form-control" />
//                     </div>
//                   </div>
//                   <div className="col-lg-3 col-md-6 col-sm-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Discount<span className="text-danger ms-1">*</span>
//                       </label>
//                       <input type="text" className="form-control" />
//                     </div>
//                   </div>
//                   <div className="col-lg-3 col-md-6 col-sm-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Shipping<span className="text-danger ms-1">*</span>
//                       </label>
//                       <input type="text" className="form-control" />
//                     </div>
//                   </div>
//                   <div className="col-lg-3 col-md-6 col-sm-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Status<span className="text-danger ms-1">*</span>
//                       </label>
//                       <CommonSelect
//                         className="w-100"
//                         options={statusOptions}
//                         value={selectedStatus}
//                         onChange={(e) => setSelectedStatus(e.value)}
//                         placeholder="Select Status"
//                         filter={false}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-lg-12 mt-3">
//                 <div className="mb-3 summer-description-box">
//                   <label className="form-label">Description</label>
//                   <div id="summernote" />
//                   <p className="mt-1">Maximum 60 Words</p>
//                 </div>
//               </div>
//             </div>
//             <div className="modal-footer">
//               <button type="button" className="btn me-2 btn-secondary" data-bs-dismiss="modal">
//                 Cancel
//               </button>
//               <button type="submit" className="btn btn-primary">
//                 Submit
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// const CreatePurchaseListModal = ({ supplierOptions }) => {
//   const [selectedSupplier, setSelectedSupplier] = useState('');
//   const [selectedStatus, setSelectedStatus] = useState('');
//   const [date, setDate] = useState<Date | null>(new Date());
//   const [paymentType, setPaymentType] = useState('');
//   const [paymentMethod, setPaymentMethod] = useState('');

//   const statusOptions = [
//     { label: 'Select', value: '' },
//     { label: 'Received', value: 'received' },
//     { label: 'Pending', value: 'pending' }
//   ];

//   const paymentTypeOptions = [
//     { label: 'Cash', value: 'cash' },
//     { label: 'Credit', value: 'credit' }
//   ];

//   const paymentMethodOptions = [
//     { label: 'Bank', value: 'bank' },
//     { label: 'Mobile Money', value: 'mobile_money' },
//     { label: 'Cash', value: 'cash' }
//   ];

//   return (
//     <div className="modal fade" id="add-purchase">
//       <div className="modal-dialog purchase modal-dialog-centered">
//         <div className="modal-content">
//           <div className="modal-header">
//             <div className="page-title">
//               <h4>Add Purchase</h4>
//             </div>
//             <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
//               <span aria-hidden="true">×</span>
//             </button>
//           </div>

//           <form>
//             <div className="modal-body">
//               <div className="row">
//                 {/* Supplier Name */}
//                 <div className="col-lg-4 col-md-6 col-sm-12">
//                   <div className="mb-3 add-product">
//                     <label className="form-label">
//                       Supplier Name<span className="text-danger ms-1">*</span>
//                     </label>
//                     <div className="row">
//                       <div className="col-lg-10 col-sm-10 col-10">
//                         <CommonSelect
//                           className="w-100"
//                           options={supplierOptions}
//                           value={selectedSupplier}
//                           onChange={(e) => setSelectedSupplier(e.value)}
//                           placeholder="Select Supplier"
//                           filter={false}
//                         />
//                       </div>
//                       <div className="col-lg-2 col-sm-2 col-2 ps-0">
//                         <div className="add-icon tab">
//                           <Link to="#" data-bs-toggle="modal" data-bs-target="#add_customer">
//                             <i className="feather icon-plus-circle" />
//                           </Link>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Arrival Date */}
//                 <div className="col-lg-4 col-md-6 col-sm-12">
//                   <div className="mb-3">
//                     <label className="form-label">
//                       Arrival Date<span className="text-danger ms-1">*</span>
//                     </label>
//                     <div className="input-groupicon calender-input">
//                       <i className="feather icon-plus-calendar info-img" />
//                       <CommonDatePicker appendTo={'self'} value={date} onChange={setDate} className="w-100" />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Reference */}
//                 <div className="col-lg-4 col-sm-12">
//                   <div className="mb-3">
//                     <label className="form-label">
//                       Reference<span className="text-danger ms-1">*</span>
//                     </label>
//                     <input type="text" className="form-control" name="payment_reference" placeholder="INV-XXXX-XXX" />
//                   </div>
//                 </div>
//               </div>

//               {/* Batch + Supplier Product */}
//               <div className="row">
//                 <div className="col-lg-6 col-sm-12">
//                   <div className="mb-3">
//                     <label className="form-label">Batch</label>
//                     <input type="text" className="form-control" name="batch" placeholder="BATCH-2025-XXX" />
//                   </div>
//                 </div>
//                 <div className="col-lg-6 col-sm-12">
//                   <div className="mb-3">
//                     <label className="form-label">Supplier Product ID</label>
//                     <input type="text" className="form-control" name="supplier_products_id" />
//                   </div>
//                 </div>
//               </div>

//               {/* Quantity + Damaged Units */}
//               <div className="row">
//                 <div className="col-lg-4 col-sm-12">
//                   <div className="mb-3">
//                     <label className="form-label">Quantity</label>
//                     <input type="number" className="form-control" name="quantity" />
//                   </div>
//                 </div>
//                 <div className="col-lg-4 col-sm-12">
//                   <div className="mb-3">
//                     <label className="form-label">Damaged Units</label>
//                     <input type="number" className="form-control" name="damaged_units" />
//                   </div>
//                 </div>
//                 <div className="col-lg-4 col-sm-12">
//                   <div className="mb-3">
//                     <label className="form-label">Unit ID</label>
//                     <input type="text" className="form-control" name="unit_id" />
//                   </div>
//                 </div>
//               </div>

//               {/* Pricing */}
//               <div className="row">
//                 <div className="col-lg-3 col-sm-12">
//                   <div className="mb-3">
//                     <label className="form-label">Purchase Cost per Unit</label>
//                     <input type="number" step="0.01" className="form-control" name="purchase_cost_per_unit" />
//                   </div>
//                 </div>
//                 <div className="col-lg-3 col-sm-12">
//                   <div className="mb-3">
//                     <label className="form-label">Total Purchase Cost</label>
//                     <input type="number" step="0.01" className="form-control" name="total_purchase_cost" />
//                   </div>
//                 </div>
//                 <div className="col-lg-3 col-sm-12">
//                   <div className="mb-3">
//                     <label className="form-label">Discounts</label>
//                     <input type="number" step="0.01" className="form-control" name="discounts" />
//                   </div>
//                 </div>
//                 <div className="col-lg-3 col-sm-12">
//                   <div className="mb-3">
//                     <label className="form-label">Tax</label>
//                     <input type="number" step="0.01" className="form-control" name="tax" />
//                   </div>
//                 </div>
//               </div>

//               {/* Payment */}
//               <div className="row">
//                 <div className="col-lg-4 col-sm-12">
//                   <div className="mb-3">
//                     <label className="form-label">Payment Type</label>

//                     <CommonSelect
//                       className="w-100"
//                       value={paymentType}
//                       onChange={(e) => setPaymentType(e.value)}
//                       filter={false}
//                       options={paymentTypeOptions}
//                       placeholder="Select Payment Type"
//                     />
//                   </div>
//                 </div>
//                 <div className="col-lg-4 col-sm-12">
//                   <div className="mb-3">
//                     <label className="form-label">Payment Method</label>
//                     <CommonSelect
//                       className="w-100"
//                       value={paymentMethod}
//                       onChange={(e) => setPaymentMethod(e.value)}
//                       filter={false}
//                       options={paymentMethodOptions}
//                       placeholder="Select Payment Method"
//                     />
//                   </div>
//                 </div>
//                 <div className="col-lg-4 col-sm-12">
//                   <div className="mb-3">
//                     <label className="form-label">Account ID</label>
//                     <input type="text" className="form-control" name="account_id" />
//                   </div>
//                 </div>
//               </div>

//               {/* Status */}
//               <div className="row">
//                 <div className="col-lg-3 col-md-6 col-sm-12">
//                   <div className="mb-3">
//                     <label className="form-label">Status</label>
//                     <CommonSelect
//                       className="w-100"
//                       options={statusOptions}
//                       value={selectedStatus}
//                       onChange={(e) => setSelectedStatus(e.value)}
//                       placeholder="Select Status"
//                       filter={false}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Description */}
//               <div className="col-lg-12 mt-3">
//                 <div className="mb-3 summer-description-box">
//                   <label className="form-label">Description</label>
//                   <div id="summernote" />
//                   <p className="mt-1">Maximum 60 Words</p>
//                 </div>
//               </div>
//             </div>

//             <div className="modal-footer">
//               <button type="button" className="btn me-2 btn-secondary" data-bs-dismiss="modal">
//                 Cancel
//               </button>
//               <button type="submit" className="btn btn-primary">
//                 Submit
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreatePurchaseListModal;
