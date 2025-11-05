import { useMemo, useState } from 'react';
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_TableOptions,
  useMaterialReactTable
} from 'material-react-table';
import { Box, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Link } from 'react-router';

import {
  useCreatePurchaseBatchPayableMutation,
  useGetAccountsQuery,
  useGetPurchaseBatchPayablesQuery
  // useUpdatePurchaseBatchPayableMutation,
  // useDeletePurchaseBatchPayableMutation,
  // useCreatePurchaseBatchPayableMutation
} from '@core/redux/api/inventory-api';
import type { Account } from '@/feature-module/interface/features-interface';

type PurchasePayable = {
  payable_id: string;
  purchase_id: string;
  batch: string;
  supplier_name: string;
  product_name: string;
  amount_due: number;
  total_paid: number;
  balance_due: number;
  payment_type: string;
  settlement_date: string | null;
};

export default function PurchasePayablesReport() {
  const { data, isLoading, isFetching, isError } = useGetPurchaseBatchPayablesQuery();
  // const [createPayable, { isLoading: isCreating }] = useCreatePurchaseBatchPayableMutation();
  // const [updatePayable, { isLoading: isUpdating }] = useUpdatePurchaseBatchPayableMutation();
  // const [deletePayable, { isLoading: isDeleting }] = useDeletePurchaseBatchPayableMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const payables = data?.data ?? [];
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // validation utils
  const validateRequired = (value: string) => !!value?.length;

  function validatePayable(values: Partial<PurchasePayable>) {
    return {
      batch: !validateRequired(values.batch || '') ? 'Batch is required' : undefined,
      supplier_name: !validateRequired(values.supplier_name || '') ? 'Supplier is required' : undefined,
      product_name: !validateRequired(values.product_name || '') ? 'Product is required' : undefined,
      amount_due: values.amount_due == null ? 'Amount Due is required' : undefined
    };
  }

  const columns = useMemo<MRT_ColumnDef<PurchasePayable>[]>(
    () => [
      { accessorKey: 'payable_id', header: 'ID', enableEditing: false },
      { accessorKey: 'batch', header: 'Batch' },
      { accessorKey: 'supplier_name', header: 'Supplier' },
      { accessorKey: 'product_name', header: 'Product' },
      {
        accessorKey: 'amount_due',
        header: 'Amount Due',
        muiEditTextFieldProps: { type: 'number' }
      },
      {
        accessorKey: 'total_paid',
        header: 'Total Paid',
        muiEditTextFieldProps: { type: 'number' }
      },
      {
        accessorKey: 'balance_due',
        header: 'Balance Due',
        muiEditTextFieldProps: { type: 'number' }
      },
      { accessorKey: 'payment_type', header: 'Payment Type' },
      {
        accessorKey: 'settlement_date',
        header: 'Settlement Date',
        Cell: ({ cell }) => (cell.getValue<string>() ? new Date(cell.getValue<string>()).toLocaleDateString() : 'Pending'),
        muiEditTextFieldProps: {
          type: 'date'
        }
      }
    ],
    [validationErrors]
  );

  // CREATE
  const handleCreatePayable: MRT_TableOptions<PurchasePayable>['onCreatingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validatePayable(values);
    if (Object.values(newValidationErrors).some(Boolean)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    const value = { ...values };
    delete value.id;
    if (value.settlement_date) {
      value['settlement_date'] = new Date(value['settlement_date']).toISOString();
    }
    // await createPayable(value);
    table.setCreatingRow(null);
  };

  // UPDATE
  const handleSavePayable: MRT_TableOptions<PurchasePayable>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validatePayable(values);
    if (Object.values(newValidationErrors).some(Boolean)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    const { ...data } = values;
    if (data.settlement_date) {
      data['settlement_date'] = new Date(data['settlement_date']).toISOString();
    }
    // await updatePayable({ id, data });
    table.setEditingRow(null);
  };

  const tableData = useMemo(
    () =>
      (payables ?? []).map((p) => ({
        ...p,
        settlement_date: p.settlement_date instanceof Date ? p.settlement_date.toISOString() : p.settlement_date
      })),
    [payables]
  );

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableEditing: true,
    getRowId: (row) => row.payable_id,
    muiTableContainerProps: { sx: { minHeight: '500px' } },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreatePayable,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSavePayable,

    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h6">Create Payable</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{internalEditComponents}</DialogContent>
        <DialogActions>
          <MRT_EditActionButtons table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h6">Edit Payable</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{internalEditComponents}</DialogContent>
        <DialogActions>
          <MRT_EditActionButtons table={table} row={row} />
        </DialogActions>
      </>
    ),

    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '0.5rem' }}>
        <Link className="me-2 p-2 d-flex align-items-center border rounded" to="#" onClick={() => table.setEditingRow(row)}>
          <i data-feather="edit" className="feather-edit" />
        </Link>
        <Link
          data-bs-toggle="modal"
          data-bs-target="#settle-payable-modal"
          onClick={() => setDeleteId(row.original.purchase_id)}
          className="me-2 p-2 d-flex align-items-center border rounded error"
          to="#"
        >
          <i data-feather="trash-2" className="feather-trash-2" />
        </Link>
      </Box>
    ),

    // Removed top toolbar "Add Asset" button
    renderTopToolbarCustomActions: () => null,

    state: {
      isLoading,
      isSaving: isFetching,
      showAlertBanner: isError,
      showProgressBars: isFetching
    }
  });

  return (
    <div className="page-wrapper">
      <div className="content">
        <MaterialReactTable table={table} />
      </div>

      {/* Settle Payable Modal */}
      <SettlePayableModal payableId={deleteId} onClose={() => setDeleteId(null)} />
      {/* <div className="modal fade" id="settle-payable-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content p-5 px-3 text-center">
                <span className="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2">
                  <i className="ti ti-wallet fs-24 text-danger" />
                </span>
                <h4 className="fs-20 text-gray-9 fw-bold mb-2 mt-1">Settle Purchase Payable</h4>
                <p className="text-gray-6 mb-0 fs-16">Are you sure you want to settle this payable?</p>
                <div className="modal-footer-btn mt-3 d-flex justify-content-center">
                  <button type="button" className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (deleteId) {
                        // await deletePayable(deleteId);
                        setDeleteId(null);
                      }
                    }}
                    type="button"
                    data-bs-dismiss="modal"
                    className="btn btn-submit fs-13 fw-medium p-2 px-3"
                  >
                    Yes, Settle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}

type SettlePayableModalProps = {
  payableId: string | null;
  onClose?: () => void;
};

function SettlePayableModal({ payableId, onClose }: SettlePayableModalProps) {
  const { data: Accounts } = useGetAccountsQuery();
  console.log('payable id is ', payableId);
  const [
    settlePayable,
    {
      isLoading: isCreatingPurchase,
      reset,
      isError: isCreatingPurchaseError,
      error: createPurchaseError,
      isSuccess: iscreatepurchasesuccess
    }
  ] = useCreatePurchaseBatchPayableMutation();
  const accounts = Accounts?.data ?? [];
  // const [settlePayable, { isLoading }] = useSettlePurchaseBatchPayableMutation();
  // const settlePayable = async (args: { id: string; data: { account_id: string; amount: number } }) => {
  //   console.log('settling payable with args: ', args);
  // };

  const isLoading = false;

  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async () => {
    if (!payableId || !accountId || !amount) alert('please fill all missing fields');
    reset();
    console.log('settling');
    await settlePayable({
      purchase_id: payableId,
      account_id: accountId,
      amount
    });
    // await settlePayable({
    //   id: payableId,
    //   data: {
    //     account_id: accountId,
    //     amount: parseFloat(amount)
    //   }
    // });
    // onClose();
    setAccountId('');
    setAmount('');
  };

  return (
    <div className="modal fade" id="settle-payable-modal">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="page-wrapper-new p-0">
            <div className="content p-5 px-3 text-center">
              <span className="rounded-circle d-inline-flex p-2 bg-primary-transparent mb-2">
                <i className="ti ti-wallet fs-24 text-primary" />
              </span>
              <h4 className="fs-20 text-gray-9 fw-bold mb-3">Settle Purchase Payable</h4>

              <div className="mb-3 text-start">
                <label className="form-label fw-semibold">Select Account</label>
                <select className="form-select" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                  <option value="">-- Choose Account --</option>
                  {accounts?.map((acc: Account) => (
                    <option key={acc.account_id} value={acc.account_id}>
                      {acc.name} - {acc.running_balance}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3 text-start">
                <label className="form-label fw-semibold">Amount</label>
                <input
                  type="number"
                  className="form-control"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <div className="modal-footer-btn mt-3 d-flex justify-content-center">
                <button
                  type="button"
                  className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                  data-bs-dismiss="modal"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  type="button"
                  // data-bs-dismiss="modal"
                  className="btn btn-submit fs-13 fw-medium p-2 px-3"
                >
                  {isCreatingPurchase ? 'Settling...' : 'Settle'}
                </button>
              </div>
              {isCreatingPurchaseError ? <div>{createPurchaseError.message} </div> : null}
              {iscreatepurchasesuccess ? <div> successfully settled payment </div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import CommonFooter from '@components/footer/commonFooter';
// // import RefreshIcon from '@components/tooltip-content/refresh';
// import CollapesIcon from '@components/tooltip-content/collapes';
// import TooltipIcons from '@components/tooltip-content/tooltipIcons';
// import PrimeDataTable from '@components/data-table';
// // import CommonDateRangePicker from '@components/date-range-picker/common-date-range-picker';
// import { useGetPurchaseBatchPayablesQuery } from '@core/redux/api/inventory-api';

// const PurchasePayablesReport = () => {
//   const { data: getPurchaseBatchPayable } = useGetPurchaseBatchPayablesQuery();

//   const purchaseData = getPurchaseBatchPayable?.data ?? [];
//   console.log('purchase data is ', purchaseData);
//   const [listData, setListData] = useState<any[]>([]);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [totalRecords, setTotalRecords] = useState<number>(0);
//   const [rows, setRows] = useState<number>(10);

//   useEffect(() => {
//     if (purchaseData) {
//       setListData(purchaseData);
//       setTotalRecords(purchaseData.length);
//     }
//   }, [purchaseData]);

//   const columns = [
//     {
//       header: 'Batch',
//       field: 'batch',
//       sorter: (a: any, b: any) => a.batch.localeCompare(b.batch)
//     },
//     {
//       header: 'Supplier',
//       field: 'supplier_name',
//       sorter: (a: any, b: any) => a.supplier_name.localeCompare(b.supplier_name)
//     },
//     {
//       header: 'Product',
//       field: 'product_name',
//       sorter: (a: any, b: any) => a.product_name.localeCompare(b.product_name)
//     },
//     {
//       header: 'Amount Due',
//       field: 'amount_due',
//       sorter: (a: any, b: any) => Number(a.amount_due) - Number(b.amount_due)
//     },
//     {
//       header: 'Total Paid',
//       field: 'total_paid',
//       sorter: (a: any, b: any) => Number(a.total_paid) - Number(b.total_paid)
//     },
//     {
//       header: 'Balance Due',
//       field: 'balance_due',
//       sorter: (a: any, b: any) => Number(a.balance_due) - Number(b.balance_due)
//     },
//     {
//       header: 'Payment Type',
//       field: 'payment_type',
//       sorter: (a: any, b: any) => a.payment_type.localeCompare(b.payment_type)
//     },
//     {
//       header: 'Settlement Date',
//       field: 'settlement_date',
//       body: (row: any) => (row.settlement_date ? new Date(row.settlement_date).toLocaleDateString() : 'Pending'),
//       sorter: (a: any, b: any) => (a.settlement_date || '').localeCompare(b.settlement_date || '')
//     }
//     // {
//     //   header: 'Payable ID',
//     //   field: 'payable_id',
//     // },
//     // {
//     //   header: 'Purchase ID',
//     //   field: 'purchase_id',
//     // },
//   ];
//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         {/* Page Header */}
//         <div className="page-header">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               <h4>Purchase Payables</h4>
//               <h6>View Reports of Purchase Batches</h6>
//             </div>
//           </div>
//           <ul className="table-top-head">
//             {/* <RefreshIcon /> */}
//             <CollapesIcon />
//           </ul>
//         </div>

//         {/* Filters */}
//         {/* <div className="card border-0">
//           <div className="card-body pb-1">
//             <form>
//               <div className="row align-items-end">
//                 <div className="col-lg-10">
//                   <div className="row">
//                     <div className="col-md-3">
//                       <div className="mb-3">
//                         <label className="form-label">Choose Date</label>
//                         <div className="input-icon-start position-relative">
//                           <CommonDateRangePicker />
//                           <span className="input-icon-left">
//                             <i className="ti ti-calendar" />
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="col-lg-2">
//                   <div className="mb-3">
//                     <button className="btn btn-primary w-100" type="submit">
//                       Generate Report
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div> */}

//         {/* Data Table */}
//         <div className="card table-list-card no-search">
//           <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
//             <div>
//               <h4>Purchase Payables Report</h4>
//             </div>
//             <ul className="table-top-head">
//               <TooltipIcons />
//               <li>
//                 <Link to="#" data-bs-toggle="tooltip" data-bs-placement="top" title="Print">
//                   <i className="ti ti-printer" />
//                 </Link>
//               </li>
//             </ul>
//           </div>
//           <div className="card-body">
//             <div className="table-responsive custome-search">
//               <PrimeDataTable
//                 column={columns}
//                 data={listData}
//                 rows={rows}
//                 setRows={setRows}
//                 currentPage={currentPage}
//                 setCurrentPage={setCurrentPage}
//                 totalRecords={totalRecords}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//       <CommonFooter />
//     </div>
//   );
// };

// export default PurchasePayablesReport;
