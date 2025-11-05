import { useMemo, useState } from 'react';
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_TableOptions,
  useMaterialReactTable
} from 'material-react-table';
import { Box, Button, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import {
  useGetAccountsQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation
} from '@core/redux/api/inventory-api';
import type { Account } from '@features/interface/features-interface';

export default function AccountsTable() {
  const { data, isLoading, isFetching, isError } = useGetAccountsQuery();

  const [createAccount, { isLoading: isCreating, reset: createReset, isError: isCreatingError, error: createError }] =
    useCreateAccountMutation();
  const [updateAccount, { isLoading: isUpdating, reset: updateReset, isError: isUpdatingError, error: updateError }] =
    useUpdateAccountMutation();
  const [deleteAccount, { isLoading: isDeleting, isError: isDeletingError, error: deleteError }] = useDeleteAccountMutation();

  const accounts = data?.data ?? [];

  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // validation helpers
  const validateRequired = (val: string) => !!val?.length;

  function validateAccount(acc: Partial<Account>) {
    return {
      name: !validateRequired(acc.name ?? '') ? 'Name is Required' : undefined,
      type: !validateRequired(acc.type ?? '') ? 'Type is Required' : undefined,
      account_number: !validateRequired(acc.account_number ?? '') ? 'Account Number is Required' : undefined
    };
  }

  // const columns = useMemo<MRT_ColumnDef<Account>[]>(
  //   () => [
  //     {
  //       accessorKey: 'name',
  //       header: 'Account Holder Name',
  //       muiEditTextFieldProps: {
  //         required: true,
  //         error: !!validationErrors?.name,
  //         helperText: validationErrors?.name,
  //         onFocus: () => setValidationErrors((prev) => ({ ...prev, name: undefined }))
  //       }
  //     },
  //     {
  //       accessorKey: 'account_number',
  //       header: 'Account No',
  //       muiEditTextFieldProps: {
  //         required: true,
  //         error: !!validationErrors?.account_number,
  //         helperText: validationErrors?.account_number,
  //         onFocus: () => setValidationErrors((prev) => ({ ...prev, account_number: undefined }))
  //       }
  //     },
  //     {
  //       accessorKey: 'type',
  //       header: 'Type',
  //       muiEditTextFieldProps: {
  //         required: true,
  //         error: !!validationErrors?.type,
  //         helperText: validationErrors?.type,
  //         onFocus: () => setValidationErrors((prev) => ({ ...prev, type: undefined }))
  //       }
  //     },
  //     {
  //       accessorKey: 'balance',
  //       header: 'Opening Balance',
  //       enableEditing: false,
  //       Cell: ({ cell }) => `KES ${Number(cell.getValue()).toFixed(2)}`
  //     },
  //     {
  //       accessorKey: 'running_balance',
  //       header: 'Running Balance',
  //       enableEditing: false,
  //       Cell: ({ cell }) => `KES ${Number(cell.getValue()).toFixed(2)}`
  //     },
  //     { accessorKey: 'description', header: 'Notes' },
  //     {
  //       accessorKey: 'account_status',
  //       header: 'Status',
  //       enableEditing: false,
  //       Cell: ({ cell }) => {
  //         const status = cell.getValue<'ACTIVE' | 'INACTIVE' | 'CLOSED'>();
  //         if (status === 'ACTIVE') return <span className="badge bg-success">{status}</span>;
  //         if (status === 'CLOSED') return <span className="badge bg-danger">{status}</span>;
  //         if (status === 'INACTIVE') return <span className="badge bg-warning">{status}</span>;
  //         return status;
  //       }
  //     }
  //   ],
  //   [validationErrors]
  // );

  // CREATE

  const columns = useMemo<MRT_ColumnDef<Account>[]>(
    () => [
      {
        accessorKey: 'account_id',
        header: 'ID',
        enableEditing: false
      },
      {
        accessorKey: 'name',
        header: 'Account Name',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.name,
          helperText: validationErrors?.name,
          onFocus: () => setValidationErrors((prev) => ({ ...prev, name: undefined }))
        }
      },
      {
        accessorKey: 'account_number',
        header: 'Account Number',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.account_number,
          helperText: validationErrors?.account_number,
          onFocus: () => setValidationErrors((prev) => ({ ...prev, account_number: undefined }))
        }
      },
      {
        accessorKey: 'type',
        header: 'Account Type',
        editVariant: 'select',
        editSelectOptions: ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'],
        muiEditTextFieldProps: () => ({
          select: true,
          error: !!validationErrors?.type,
          helperText: validationErrors?.type,
          onFocus: () => setValidationErrors((prev) => ({ ...prev, type: undefined }))
          // onChange: (e) => {row?.getIsEditing() && row?.setEditingCellValue({ id: 'type', value: e.target.value })
        })
        // muiEditTextFieldProps: {
        //   select: true, // turn into dropdown
        //   children: ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'].map((option) => (
        //     <option key={option} value={option}>
        //       {option}
        //     </option>
        //   )),
        //   required: true,
        //   error: !!validationErrors?.type,
        //   helperText: validationErrors?.type,
        //   onFocus: () => setValidationErrors((prev) => ({ ...prev, type: undefined }))
        // }
      },
      {
        accessorKey: 'opening_balance',
        header: 'Opening Balance',
        Cell: ({ cell }) => `KES ${Number(cell.getValue() ?? 0).toFixed(2)}`
      },
      {
        accessorKey: 'running_balance',
        header: 'Running Balance',
        enableEditing: false,
        Cell: ({ cell }) => `KES ${Number(cell.getValue() ?? 0).toFixed(2)}`
      },
      {
        accessorKey: 'account_status',
        header: 'Status',
        enableEditing: false,
        muiEditTextFieldProps: {
          select: true,
          children: ['ACTIVE', 'INACTIVE', 'CLOSED'].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))
        },
        Cell: ({ cell }) => {
          const status = cell.getValue<'ACTIVE' | 'INACTIVE' | 'CLOSED'>();
          if (status === 'ACTIVE') return <span className="badge bg-success">{status}</span>;
          if (status === 'CLOSED') return <span className="badge bg-danger">{status}</span>;
          if (status === 'INACTIVE') return <span className="badge bg-warning">{status}</span>;
          return status;
        }
      }
    ],
    [validationErrors]
  );

  const handleCreateAccount: MRT_TableOptions<Account>['onCreatingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateAccount(values);
    if (Object.values(newValidationErrors).some(Boolean)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    createReset();
    const value = { ...values };
    delete value.account_status;
    delete value.running_balance;
    delete value.account_id;

    await createAccount(value);
    table.setCreatingRow(null);
  };

  // UPDATE
  const handleSaveAccount: MRT_TableOptions<Account>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateAccount(values);
    if (Object.values(newValidationErrors).some(Boolean)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    updateReset();
    setValidationErrors({});
    const value = { ...values };
    delete value.running_balance;
    delete value.account_status;

    await updateAccount(value);
    table.setEditingRow(null);
  };

  const table = useMaterialReactTable({
    columns,
    data: accounts,
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableEditing: true,
    getRowId: (row) => row.account_id,
    muiToolbarAlertBannerProps:
      isError || isCreatingError || isUpdatingError || isDeletingError
        ? { color: 'error', children: updateError?.message || createError?.message || deleteError?.message }
        : undefined,
    muiTableContainerProps: { sx: { minHeight: '500px' } },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateAccount,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveAccount,

    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h6">Create Account</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{internalEditComponents}</DialogContent>
        <DialogActions>
          <MRT_EditActionButtons table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h6">Edit Account</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{internalEditComponents}</DialogContent>
        <DialogActions>
          <MRT_EditActionButtons table={table} row={row} />
        </DialogActions>
      </>
    ),

    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '0.5rem' }}>
        <Button size="small" variant="outlined" onClick={() => table.setEditingRow(row)}>
          Edit
        </Button>
        <Button
          size="small"
          color="error"
          variant="outlined"
          data-bs-toggle="modal"
          data-bs-target="#delete-modal"
          onClick={() => setDeleteId(row.original.account_id)}
        >
          Delete
        </Button>
      </Box>
    ),

    renderTopToolbarCustomActions: ({ table }) => (
      <Button variant="contained" onClick={() => table.setCreatingRow(true)}>
        Add Account
      </Button>
    ),

    state: {
      isLoading,
      isSaving: isCreating || isUpdating || isDeleting,
      showAlertBanner: isError || isUpdatingError || isCreatingError || isDeletingError,
      showProgressBars: isFetching
    }
  });

  return (
    <div className="page-wrapper">
      <div className="content">
        <MaterialReactTable table={table} />
      </div>

      {/* Delete Modal */}
      <div className="modal fade" id="delete-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="p-5 text-center">
              <span className="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2">
                <i className="ti ti-trash fs-24 text-danger" />
              </span>
              <h4 className="fs-20 fw-bold mb-2 mt-1">Delete Account</h4>
              <p className="mb-0 fs-16">Are you sure you want to delete this account?</p>
              <div className="d-flex justify-content-center gap-2 mt-3">
                <button type="button" className="btn btn-secondary px-3" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (deleteId) {
                      console.log('delete id is ', deleteId);
                      await deleteAccount(deleteId);
                      setDeleteId(null);
                    }
                  }}
                  type="button"
                  className="btn btn-danger px-3"
                  data-bs-dismiss="modal"
                >
                  Yes Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// // import RefreshIcon from '../../../components/tooltip-content/refresh';
// import CollapesIcon from '../../../components/tooltip-content/collapes';
// import PrimeDataTable from '../../../components/data-table';
// // import { account_list } from '../../../core/json/accountList';
// import { account_type } from '../../../core/json/accountType';
// import CommonFooter from '../../../components/footer/commonFooter';
// import { Link } from 'react-router-dom';
// import AccountListModal from './accountListModal';
// import TableTopHead from '../../../components/table-top-head';
// import DeleteModal from '../../../components/delete-modal';
// import SearchFromApi from '../../../components/data-table/search';
// import { useState } from 'react';
// import { useGetAccountsQuery } from '@core/redux/api/inventory-api';
// // import type { AccountStatus } from '@features/interface/enums';
// import CreateAccountModal from './create-account-modal';
// import type { Account } from '@features/interface/features-interface';

// import { useMemo, useState } from 'react';
// import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef, type MRT_TableOptions } from 'material-react-table';
// import {
//   useGetAccountsQuery,
//   useCreateAccountMutation
//   // useUpdateAccountMutation,
//   // useDeleteAccountMutation
// } from '@core/redux/api/inventory-api';
// import { getDefaultMRTOptions } from '@components/material-react-data-table';
// import type { Account } from '@features/interface/features-interface';

// const defaultMRTOptions = getDefaultMRTOptions<Account>();

// // Validation helpers
// const validateRequired = (value: string) => !!value?.length;

// function validateAccount(account: Partial<Account>) {
//   return {
//     name: !validateRequired(account.name ?? '') ? 'Name is Required' : '',
//     type: !validateRequired(account.type ?? '') ? 'Type is Required' : '',
//     account_number: !validateRequired(account.account_number ?? '') ? 'Account Number is Required' : ''
//   };
// }

// export default function AccountsTable() {
//   const { data, isLoading, isError } = useGetAccountsQuery();
//   const [createAccount] = useCreateAccountMutation();
//   // const [updateAccount] = useUpdateAccountMutation();
//   // const [deleteAccount] = useDeleteAccountMutation();

//   const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

//   const accounts = data?.data ?? [];

//   //  CREATE action
//   const handleCreateAccount: MRT_TableOptions<Account>['onCreatingRowSave'] = async ({ values, table }) => {
//     const newValidationErrors = validateAccount(values);
//     if (Object.values(newValidationErrors).some((e) => e)) {
//       setValidationErrors(newValidationErrors);
//       return;
//     }
//     setValidationErrors({});
//     await createAccount(values);
//     table.setCreatingRow(null);
//   };

//   //  UPDATE action
//   const handleSaveAccount: MRT_TableOptions<Account>['onEditingRowSave'] = async ({ values, table }) => {
//     const newValidationErrors = validateAccount(values);
//     if (Object.values(newValidationErrors).some((e) => e)) {
//       setValidationErrors(newValidationErrors);
//       return;
//     }
//     setValidationErrors({});
//     alert('Saved successfully (not really, this is a demo).');
//     // await updateAccount({ id: row.original.account_id, ...values });
//     table.setEditingRow(null);
//   };

//   //  DELETE action
//   // const openDeleteConfirmModal = (row: MRT_Row<Account>) => {
//   const openDeleteConfirmModal = () => {
//     if (window.confirm('Are you sure you want to delete this account?')) {
//       // deleteAccount({ id: row.original.account_id });
//       alert('Deleted successfully (not really, this is a demo).');
//     }
//   };

//   const columns = useMemo<MRT_ColumnDef<Account>[]>(
//     () => [
//       { accessorKey: 'name', header: 'Account Holder Name' },
//       { accessorKey: 'account_number', header: 'Account No' },
//       { accessorKey: 'type', header: 'Type' },
//       {
//         accessorKey: 'balance',
//         header: 'Opening Balance',
//         Cell: ({ cell }) => `KES ${Number(cell.getValue()).toFixed(2)}`
//       },
//       {
//         accessorKey: 'running_balance',
//         header: 'Running Balance',
//         muiEditTextFieldProps: {
//           error: !!validationErrors['running_balance'],
//           helperText: validationErrors['running_balance']
//         },
//         Cell: ({ cell }) => `KES ${Number(cell.getValue()).toFixed(2)}`
//       },
//       { accessorKey: 'description', header: 'Notes' },
//       {
//         accessorKey: 'account_status',
//         header: 'Status',
//         Cell: ({ cell }) => {
//           const status = cell.getValue<'ACTIVE' | 'INACTIVE' | 'CLOSED'>();
//           if (status === 'ACTIVE') {
//             return <span className="badge table-badge bg-success fw-medium fs-10">{status}</span>;
//           }
//           if (status === 'CLOSED') {
//             return <span className="badge table-badge bg-danger fw-medium fs-10">{status}</span>;
//           }
//           if (status === 'INACTIVE') {
//             return <span className="badge table-badge bg-warning fw-medium fs-10">{status}</span>;
//           }
//           return status;
//         }
//       }
//     ],
//     []
//   );

//   const table = useMaterialReactTable({
//     ...defaultMRTOptions,
//     columns,
//     data: accounts,
//     enableEditing: true,
//     state: { isLoading },
//     getRowId: (row) => row.account_id,
//     //  Hook in handlers
//     onCreatingRowCancel: () => setValidationErrors({}),
//     onCreatingRowSave: handleCreateAccount,
//     onEditingRowCancel: () => setValidationErrors({}),
//     onEditingRowSave: handleSaveAccount,
//     renderRowActions: () => (
//       <button onClick={() => openDeleteConfirmModal()} className="text-red-600 hover:underline">
//         Delete
//       </button>
//     ),
//     initialState: {
//       ...defaultMRTOptions.initialState,
//       showColumnFilters: false
//     }
//   });

//   if (isLoading) return <div>Loading accounts…</div>;
//   if (isError) return <div>Error fetching accounts.</div>;

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <MaterialReactTable table={table} />
//       </div>
//     </div>
//   );
// }

// const Accountlist = () => {
//   const { data, isLoading, isError, error } = useGetAccountsQuery();
//   console.log('acccounts data ', data?.data);
//   // const dataSource = account_list;
//   const dataSource = data?.data;
//   const dataSource2 = account_type;

//   const columns = [
//     {
//       header: 'Account Holder Name',
//       field: 'name'
//     },
//     {
//       header: 'Account No',
//       field: 'account_number'
//     },
//     {
//       header: 'Type',
//       field: 'type'
//     },
//     {
//       header: 'Opening Balance',
//       field: 'opening_balance'
//     },
//     {
//       header: 'running Balance',
//       field: 'running_balance'
//     },
//     {
//       header: 'Notes',
//       field: 'description'
//     },
//     {
//       header: 'Status',
//       field: 'account_status',
//       body: (text: Account) => (
//         <div>
//           {/* <div>mee yes me ... {JSON.stringify(text.account_status === 'ACTIVE' ? 'Active' : text.account_status)} </div> */}
//           {/* {JSON.stringify(text)} */}
//           {text?.account_status === 'ACTIVE' && (
//             <span className="badge table-badge bg-success fw-medium fs-10">{text?.account_status}</span>
//           )}
//           {text?.account_status === 'CLOSED' && <span className="badge table-badge bg-danger fw-medium fs-10">{text?.account_status}</span>}
//           {text?.account_status === 'INACTIVE' && (
//             <span className="badge table-badge bg-warning fw-medium fs-10">{text?.account_status}</span>
//           )}
//         </div>
//       ),
//       sortable: false
//     },
//     {
//       header: '',
//       field: 'actions',
//       key: 'actions',
//       body: () => (
//         <div className="action-table-data">
//           <div className="edit-delete-action">
//             <Link className="me-2 p-2" to="#" data-bs-toggle="modal" data-bs-target="#edit-units">
//               <i className="ti ti-edit" />
//             </Link>
//             <Link className="confirm-text p-2" to="#" data-bs-toggle="modal" data-bs-target="#delete-modal">
//               <i className="ti ti-trash" />
//             </Link>
//           </div>
//         </div>
//       ),
//       sortable: false
//     }
//   ];

//   // const columns2 = [
//   //   {
//   //     header: 'Account Holder Name',
//   //     field: 'accountholder'
//   //   },
//   //   {
//   //     header: 'Account No',
//   //     field: 'accountno'
//   //   },
//   //   {
//   //     header: 'Type',
//   //     field: 'type'
//   //   },
//   //   {
//   //     header: 'Opening Balance',
//   //     field: 'balance'
//   //   },
//   //   {
//   //     header: 'Notes',
//   //     field: 'note'
//   //   },
//   //   {
//   //     header: 'Status',
//   //     field: 'status',
//   //     body: (text: any) => (
//   //       <div>
//   //         {text?.status === 'Active' && <span className="badge table-badge bg-success fw-medium fs-10">{text?.status}</span>}
//   //         {text?.status === 'Closed' && <span className="badge table-badge bg-danger fw-medium fs-10">{text?.status}</span>}
//   //       </div>
//   //     ),
//   //     sortable: false
//   //   },
//   //   {
//   //     header: '',
//   //     field: 'actions',
//   //     key: 'actions',
//   //     body: () => (
//   //       <div className="action-table-data">
//   //         <div className="edit-delete-action">
//   //           <Link className="me-2 p-2" to="#" data-bs-toggle="modal" data-bs-target="#edit-units">
//   //             <i className="ti ti-edit" />
//   //           </Link>
//   //           <Link className="confirm-text p-2" to="#" data-bs-toggle="modal" data-bs-target="#delete-modal">
//   //             <i className="ti ti-trash" />
//   //           </Link>
//   //         </div>
//   //       </div>
//   //     ),
//   //     sortable: false
//   //   }
//   // ];
//   const column = [
//     {
//       header: 'Type',
//       field: 'Type'
//     },
//     {
//       header: 'Created Date',
//       field: 'Created_Date'
//     },
//     {
//       header: 'Status',
//       field: 'Status',
//       body: (text: any) => (
//         <div>
//           {text?.Status === 'Active' && <span className="badge table-badge bg-success fw-medium fs-10">{text?.Status}</span>}
//           {text?.Status === 'Inactive' && <span className="badge table-badge bg-danger fw-medium fs-10">{text?.Status}</span>}
//         </div>
//       )
//     },

//     {
//       header: '',
//       field: 'actions',
//       key: 'actions',
//       body: () => (
//         <div className="action-table-data">
//           <div className="edit-delete-action">
//             <Link className="me-2 p-2" to="#" data-bs-toggle="modal" data-bs-target="#edit-units">
//               <i className="ti ti-edit" />
//             </Link>
//             <Link className="confirm-text p-2" to="#" data-bs-toggle="modal" data-bs-target="#delete-modal">
//               <i className="ti ti-trash" />
//             </Link>
//           </div>
//         </div>
//       ),
//       sortable: false
//     }
//   ];
//   const [rows, setRows] = useState<number>(10);
//   const [_searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
//   console.log('search query is ', _searchQuery);

//   const handleSearch = (value: string) => {
//     setSearchQuery(value);
//   };

//   // const refreshHandler = () => {
//   //   console.log('refreshing......');
//   //   alert('hey');
//   // };

//   if (isLoading) return <div>fetching data </div>;

//   if (isError) return <div> error fetching accounts </div>;

//   return (
//     <>
//       <div className="page-wrapper">
//         <div className="content">
//           <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
//             <ul className="nav nav-pills low-stock-tab d-flex me-2 mb-0" id="pills-tab" role="tablist">
//               <li className="nav-item" role="presentation">
//                 <button
//                   className="nav-link active"
//                   id="pills-home-tab"
//                   data-bs-toggle="pill"
//                   data-bs-target="#pills-home"
//                   type="button"
//                   role="tab"
//                   aria-controls="pills-home"
//                   aria-selected="true"
//                 >
//                   Accounts List
//                 </button>
//               </li>
//               <li className="nav-item" role="presentation">
//                 <button
//                   className="nav-link"
//                   id="pills-profile-tab"
//                   data-bs-toggle="pill"
//                   data-bs-target="#pills-profile"
//                   type="button"
//                   role="tab"
//                   aria-controls="pills-profile"
//                   aria-selected="false"
//                 >
//                   Account Type
//                 </button>
//               </li>
//             </ul>
//           </div>

//           <div className="tab-content" id="pills-tabContent">
//             <div className="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">
//               <div className="page-header">
//                 <div className="add-item d-flex">
//                   <div className="page-title">
//                     <h4 className="fw-bold">Accounts List</h4>
//                     <h6>Manage your Accounts List</h6>
//                   </div>
//                 </div>
//                 <TableTopHead />
//                 <div className="page-btn">
//                   <Link to="#" className="btn btn-primary text-white" data-bs-toggle="modal" data-bs-target="#add-units">
//                     <i className="ti ti-circle-plus me-1"></i>
//                     Add Account List
//                   </Link>
//                 </div>
//               </div>
//               {/* /product list */}
//               <div className="card table-list-card">
//                 <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
//                   <SearchFromApi callback={handleSearch} rows={rows} setRows={setRows} />
//                   <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
//                     <div className="dropdown me-2">
//                       <Link
//                         to="#"
//                         className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
//                         data-bs-toggle="dropdown"
//                       >
//                         Status
//                       </Link>
//                       <ul className="dropdown-menu  dropdown-menu-end p-3">
//                         <li>
//                           <Link to="#" className="dropdown-item rounded-1">
//                             Active
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="#" className="dropdown-item rounded-1">
//                             Inactive
//                           </Link>
//                         </li>
//                       </ul>
//                     </div>
//                     <div className="dropdown">
//                       <Link
//                         to="#"
//                         className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
//                         data-bs-toggle="dropdown"
//                       >
//                         Sort By : Last 7 Days
//                       </Link>
//                       <ul className="dropdown-menu  dropdown-menu-end p-3">
//                         <li>
//                           <Link to="#" className="dropdown-item rounded-1">
//                             Recently Added
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="#" className="dropdown-item rounded-1">
//                             Ascending
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="#" className="dropdown-item rounded-1">
//                             Desending
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="#" className="dropdown-item rounded-1">
//                             Last Month
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="#" className="dropdown-item rounded-1">
//                             Last 7 Days
//                           </Link>
//                         </li>
//                       </ul>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="card-body">
//                   <div className="table-responsive">
//                     <PrimeDataTable
//                       column={columns}
//                       data={dataSource}
//                       totalRecords={10}
//                       rows={10}
//                       setRows={() => {}}
//                       currentPage={1}
//                       setCurrentPage={() => {}}
//                     />{' '}
//                   </div>
//                 </div>
//               </div>
//               {/* /product list */}
//             </div>
//             <div className="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
//               <div className="page-header">
//                 <div className="add-item d-flex">
//                   <div className="page-title">
//                     <h4 className="fw-bold">Accounts Type</h4>
//                     <h6>Manage your Accounts Type</h6>
//                   </div>
//                 </div>
//                 <ul className="table-top-head">
//                   {/* <RefreshIcon fn={refreshHandler} /> */}
//                   <CollapesIcon />
//                 </ul>
//                 <div className="page-btn">
//                   <Link to="#" className="btn btn-primary text-white" data-bs-toggle="modal" data-bs-target="#add-units2">
//                     <i className="feather icon-plus-circle me-2" />
//                     Add Account Type
//                   </Link>
//                 </div>
//               </div>
//               {/* /product list */}
//               <div className="card table-list-card">
//                 <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
//                   <SearchFromApi callback={handleSearch} rows={rows} setRows={setRows} />
//                   <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
//                     <div className="dropdown me-2">
//                       <Link
//                         to="#"
//                         className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
//                         data-bs-toggle="dropdown"
//                       >
//                         Status
//                       </Link>
//                       <ul className="dropdown-menu  dropdown-menu-end p-3">
//                         <li>
//                           <Link to="#" className="dropdown-item rounded-1">
//                             Active
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="#" className="dropdown-item rounded-1">
//                             Inactive
//                           </Link>
//                         </li>
//                       </ul>
//                     </div>
//                     <div className="dropdown">
//                       <Link
//                         to="#"
//                         className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
//                         data-bs-toggle="dropdown"
//                       >
//                         Sort By : Last 7 Days
//                       </Link>
//                       <ul className="dropdown-menu  dropdown-menu-end p-3">
//                         <li>
//                           <Link to="#" className="dropdown-item rounded-1">
//                             Recently Added
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="#" className="dropdown-item rounded-1">
//                             Ascending
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="#" className="dropdown-item rounded-1">
//                             Desending
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="#" className="dropdown-item rounded-1">
//                             Last Month
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="#" className="dropdown-item rounded-1">
//                             Last 7 Days
//                           </Link>
//                         </li>
//                       </ul>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="card-body">
//                   <div className="table-responsive">
//                     <PrimeDataTable
//                       column={column}
//                       data={dataSource2}
//                       totalRecords={10}
//                       rows={10}
//                       setRows={() => {}}
//                       currentPage={1}
//                       setCurrentPage={() => {}}
//                     />{' '}
//                   </div>
//                 </div>
//               </div>
//               {/* /product list */}
//             </div>
//           </div>
//         </div>
//         <CommonFooter />
//       </div>
//       <AccountListModal />
//       <CreateAccountModal />
//       <DeleteModal />
//     </>
//   );
// };

// export default Accountlist;
