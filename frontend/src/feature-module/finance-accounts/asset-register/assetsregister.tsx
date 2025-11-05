import { useMemo, useState } from 'react';
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_TableOptions,
  useMaterialReactTable
} from 'material-react-table';
import { Box, Button, DialogActions, DialogContent, DialogTitle, MenuItem } from '@mui/material';
import { Link } from 'react-router';

import {
  useGetAssetsQuery,
  useGetAccountsQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation
} from '@core/redux/api/inventory-api';
import type { Account, Asset } from '@/feature-module/interface/features-interface';

export default function AssetsTable() {
  const { data, isLoading, isFetching, isError } = useGetAssetsQuery();
  const [createAsset, { isLoading: isCreating, reset: createReset, isError: isCreatingError, error: createError }] =
    useCreateAssetMutation();
  const [updateAsset, { isLoading: isUpdating, reset: updateReset, isError: isUpdatingError, error: updateError }] =
    useUpdateAssetMutation();
  const [deleteAsset, { isLoading: isDeleting }] = useDeleteAssetMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: accountsdata } = useGetAccountsQuery();
  const assets = data?.data ?? [];
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const Accountsdata = accountsdata?.data ?? [];

  // validation utils
  const validateRequired = (value: string) => !!value?.length;

  function validateAsset(asset: Partial<Asset>) {
    return {
      name: !validateRequired(asset.name || '') ? 'Asset Name is required' : undefined,
      category: !validateRequired(asset.category || '') ? 'Category is required' : undefined,
      assetTag: !validateRequired(asset.assetTag || '') ? 'Asset Tag is required' : undefined,
      purchaseCost: !asset.purchaseCost ? 'Purchase Cost is required' : undefined
    };
  }

  const columns = useMemo<MRT_ColumnDef<Asset>[]>(
    () => [
      { accessorKey: 'id', header: 'ID', enableEditing: false },
      {
        accessorKey: 'assetTag',
        header: 'Asset Tag',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.assetTag,
          helperText: validationErrors?.assetTag,
          onFocus: () => setValidationErrors((prev) => ({ ...prev, assetTag: undefined }))
        }
      },
      {
        accessorKey: 'name',
        header: 'Asset Name',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.name,
          helperText: validationErrors?.name,
          onFocus: () => setValidationErrors((prev) => ({ ...prev, name: undefined }))
        }
      },
      {
        accessorKey: 'category',
        header: 'Category',
        editVariant: 'select',
        editSelectOptions: ['CURRENT', 'NON_CURRENT', 'OTHER'],
        muiEditTextFieldProps: {
          select: true,
          required: true,
          error: !!validationErrors?.category,
          helperText: validationErrors?.category,
          onFocus: () => setValidationErrors((prev) => ({ ...prev, category: undefined }))
        }
      },
      { accessorKey: 'description', header: 'Description' },
      {
        accessorKey: 'purchaseDate',
        header: 'Purchase Date',
        Cell: ({ cell }) => cell.getValue<string>() && new Date(cell.getValue<string>()).toLocaleDateString(),
        muiEditTextFieldProps: {
          type: 'date' // <-- this makes it a calendar when creating/editing
        }
      },
      // {
      //   accessorKey: 'purchaseDate',
      //   header: 'Purchase Date',
      //   Cell: ({ cell }) => cell.getValue<string>() && new Date(cell.getValue<string>()).toLocaleDateString()
      // },
      {
        accessorKey: 'purchaseCost',
        header: 'Purchase Cost',
        muiEditTextFieldProps: {
          type: 'number',
          required: true,
          error: !!validationErrors?.purchaseCost,
          helperText: validationErrors?.purchaseCost,
          onFocus: () => setValidationErrors((prev) => ({ ...prev, purchaseCost: undefined }))
        },
        Cell: ({ cell }) => `KES ${Number(cell.getValue()).toFixed(2)}`
      },
      {
        accessorKey: 'accountId', // this is the field in your AssetRegister model
        header: 'Account',
        Cell: ({ cell }) => {
          const account = Accountsdata.find((acc: Account) => acc.account_id === cell.getValue<string>());
          return (
            <span
              className={`p-1 pe-2 rounded-1 fs-10 ${
                cell.getValue<string>() == null ? 'text-danger bg-danger-transparent' : 'text-success bg-success-transparent'
              }`}
            >
              <i className="ti ti-point-filled me-1 fs-11"></i>
              {account ? account.name : 'credit'}
            </span>
          );
        },
        muiEditTextFieldProps: {
          select: true, // make it a dropdown
          children: Accountsdata.map((acc: Account) => (
            <MenuItem key={acc.account_id} value={acc.account_id}>
              {acc.name}
            </MenuItem>
          ))
        }
      },
      { accessorKey: 'supplier', header: 'Supplier' },
      { accessorKey: 'location', header: 'Location' },
      {
        accessorKey: 'status',
        header: 'Status',
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();
          if (status === 'active') return <span className="badge bg-success">{status}</span>;
          if (status === 'under_maintenance') return <span className="badge bg-warning">{status}</span>;
          if (status === 'disposed') return <span className="badge bg-danger">{status}</span>;
          return status;
        }
      },
      { accessorKey: 'depreciation', header: 'Depreciation', Cell: ({ cell }) => String(cell.getValue() ?? '-') },
      { accessorKey: 'usefulLifeYears', header: 'Useful Life (Years)' },
      { accessorKey: 'custodianId', header: 'Custodian', enableEditing: false },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        enableEditing: false,
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString()
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated At',
        enableEditing: false,
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString()
      }
    ],
    [validationErrors]
  );

  // CREATE
  const handleCreateAsset: MRT_TableOptions<Asset>['onCreatingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateAsset(values);
    if (Object.values(newValidationErrors).some(Boolean)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    createReset();
    const value = { ...values };
    delete value.id;
    delete value.createdAt;
    delete value.updatedAt;
    delete value.custodianId;
    value['purchaseDate'] = new Date(value['purchaseDate']).toISOString();
    await createAsset(value);
    table.setCreatingRow(null);
  };

  // UPDATE
  const handleSaveAsset: MRT_TableOptions<Asset>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateAsset(values);
    if (Object.values(newValidationErrors).some(Boolean)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    updateReset();
    setValidationErrors({});
    const value = { ...values };
    delete value.createdAt;
    delete value.updatedAt;
    delete value.custodianId;
    const { id, ...data } = value;
    await updateAsset({ id, data });
    table.setEditingRow(null);
  };

  const table = useMaterialReactTable({
    columns,
    data: assets ?? [],
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableEditing: true,
    getRowId: (row) => row.id,
    muiToolbarAlertBannerProps:
      isError || isUpdatingError || isCreatingError
        ? { color: 'error', children: updateError?.message || createError?.message }
        : undefined,
    muiTableContainerProps: { sx: { minHeight: '500px' } },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateAsset,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveAsset,

    // custom modals
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h6">Create Asset</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{internalEditComponents}</DialogContent>
        <DialogActions>
          <MRT_EditActionButtons table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h6">Edit Asset</DialogTitle>
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
          data-bs-target="#delete-asset-modal"
          onClick={() => setDeleteId(row.original.id)}
          className="me-2 p-2 d-flex align-items-center border rounded error"
          to="#"
        >
          <i data-feather="trash-2" className="feather-trash-2" />
        </Link>
      </Box>
    ),

    renderTopToolbarCustomActions: ({ table }) => (
      <Button variant="contained" onClick={() => table.setCreatingRow(true)}>
        Add Asset
      </Button>
    ),

    state: {
      isLoading,
      isSaving: isCreating || isUpdating || isDeleting,
      showAlertBanner: isError || isUpdatingError || isCreatingError,
      showProgressBars: isFetching
    }
  });

  return (
    <div className="page-wrapper">
      <div className="content">
        <MaterialReactTable table={table} />
      </div>
      {/* Delete Modal */}
      <div className="modal fade" id="delete-asset-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content p-5 px-3 text-center">
                <span className="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2">
                  <i className="ti ti-trash fs-24 text-danger" />
                </span>
                <h4 className="fs-20 text-gray-9 fw-bold mb-2 mt-1">Delete Asset</h4>
                <p className="text-gray-6 mb-0 fs-16">Are you sure you want to delete this asset?</p>
                <div className="modal-footer-btn mt-3 d-flex justify-content-center">
                  <button type="button" className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (deleteId) {
                        await deleteAsset(deleteId);
                        setDeleteId(null);
                      }
                    }}
                    type="button"
                    data-bs-dismiss="modal"
                    className="btn btn-submit fs-13 fw-medium p-2 px-3"
                  >
                    Yes Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// import { useMemo, useState } from 'react';
// import {
//   MRT_EditActionButtons,
//   MaterialReactTable,
//   type MRT_ColumnDef,
//   type MRT_TableOptions,
//   useMaterialReactTable
// } from 'material-react-table';
// import { Box, Button, DialogActions, DialogContent, DialogTitle } from '@mui/material';
// import { Link } from 'react-router';

// import { useGetAssetsQuery, useCreateAssetMutation, useUpdateAssetMutation, useDeleteAssetMutation } from '@core/redux/api/inventory-api';
// import type { Asset } from '@/feature-module/interface/features-interface';
// // import type { Asset } from '../interface/features-interface';

// export default function AssetsTable() {
//   const { data, isLoading, isFetching, isError } = useGetAssetsQuery();
//   const [createAsset, { isLoading: isCreating, reset: createReset, isError: isCreatingError, error: createError }] =
//     useCreateAssetMutation();
//   const [updateAsset, { isLoading: isUpdating, reset: updateReset, isError: isUpdatingError, error: updateError }] =
//     useUpdateAssetMutation();
//   const [deleteAsset, { isLoading: isDeleting }] = useDeleteAssetMutation();
//   const [deleteId, setDeleteId] = useState<string | null>(null);

//   const assets = data?.data ?? [];
//   const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

//   // validation utils
//   const validateRequired = (value: string) => !!value?.length;

//   function validateAsset(asset: Partial<Asset>) {
//     return {
//       name: !validateRequired(asset.name || '') ? 'Asset Name is Required' : undefined,
//       category: !validateRequired(asset.category || '') ? 'Category is Required' : undefined,
//       value: !asset.value ? 'Asset Value is Required' : undefined
//     };
//   }

//   const columns = useMemo<MRT_ColumnDef<Asset>[]>(
//     () => [
//       {
//         accessorKey: 'id',
//         header: 'ID',
//         enableEditing: false
//       },
//       {
//         accessorKey: 'name',
//         header: 'Asset Name',
//         muiEditTextFieldProps: {
//           required: true,
//           error: !!validationErrors?.name,
//           helperText: validationErrors?.name,
//           onFocus: () => setValidationErrors((prev) => ({ ...prev, name: undefined }))
//         }
//       },
//       {
//         accessorKey: 'category',
//         header: 'Category',
//         muiEditTextFieldProps: {
//           required: true,
//           error: !!validationErrors?.category,
//           helperText: validationErrors?.category,
//           onFocus: () => setValidationErrors((prev) => ({ ...prev, category: undefined }))
//         }
//       },
//       {
//         accessorKey: 'value',
//         header: 'Value',
//         muiEditTextFieldProps: {
//           type: 'number',
//           required: true,
//           error: !!validationErrors?.value,
//           helperText: validationErrors?.value,
//           onFocus: () => setValidationErrors((prev) => ({ ...prev, value: undefined }))
//         }
//       },
//       {
//         accessorKey: 'purchaseDate',
//         header: 'Purchase Date',
//         Cell: ({ cell }) => cell.getValue<string>() && new Date(cell.getValue<string>()).toLocaleDateString()
//       },
//       {
//         accessorKey: 'location',
//         header: 'Location'
//       },
//       {
//         accessorKey: 'custodian',
//         header: 'Custodian'
//       },
//       {
//         accessorKey: 'createdAt',
//         header: 'Created At',
//         enableEditing: false,
//         Cell: ({ cell }) => cell.getValue<string>() && new Date(cell.getValue<string>()).toLocaleDateString()
//       },
//       {
//         accessorKey: 'updatedAt',
//         header: 'Updated At',
//         enableEditing: false,
//         Cell: ({ cell }) => cell.getValue<string>() && new Date(cell.getValue<string>()).toLocaleDateString()
//       }
//     ],
//     [validationErrors]
//   );

//   // CREATE
//   const handleCreateAsset: MRT_TableOptions<Asset>['onCreatingRowSave'] = async ({ values, table }) => {
//     const newValidationErrors = validateAsset(values);
//     if (Object.values(newValidationErrors).some(Boolean)) {
//       setValidationErrors(newValidationErrors);
//       return;
//     }
//     setValidationErrors({});
//     createReset();
//     const value = { ...values };
//     delete value.id;
//     delete value.createdAt;
//     delete value.updatedAt;
//     await createAsset(value).unwrap();
//     table.setCreatingRow(null);
//   };

//   // UPDATE
//   const handleSaveAsset: MRT_TableOptions<Asset>['onEditingRowSave'] = async ({ values, table }) => {
//     const newValidationErrors = validateAsset(values);
//     if (Object.values(newValidationErrors).some(Boolean)) {
//       setValidationErrors(newValidationErrors);
//       return;
//     }
//     updateReset();
//     setValidationErrors({});
//     const value = { ...values };
//     delete value.createdAt;
//     delete value.updatedAt;
//     await updateAsset(value);
//     table.setEditingRow(null);
//   };

//   const table = useMaterialReactTable({
//     columns,
//     data: assets ?? [],
//     createDisplayMode: 'row',
//     editDisplayMode: 'row',
//     enableEditing: true,
//     getRowId: (row) => row.id,
//     muiToolbarAlertBannerProps:
//       isError || isUpdatingError || isCreatingError
//         ? {
//             color: 'error',
//             children: updateError?.message || createError?.message
//           }
//         : undefined,
//     muiTableContainerProps: { sx: { minHeight: '500px' } },
//     onCreatingRowCancel: () => setValidationErrors({}),
//     onCreatingRowSave: handleCreateAsset,
//     onEditingRowCancel: () => setValidationErrors({}),
//     onEditingRowSave: handleSaveAsset,

//     // custom modals
//     renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
//       <>
//         <DialogTitle variant="h6">Create Asset</DialogTitle>
//         <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{internalEditComponents}</DialogContent>
//         <DialogActions>
//           <MRT_EditActionButtons table={table} row={row} />
//         </DialogActions>
//       </>
//     ),
//     renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
//       <>
//         <DialogTitle variant="h6">Edit Asset</DialogTitle>
//         <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{internalEditComponents}</DialogContent>
//         <DialogActions>
//           <MRT_EditActionButtons table={table} row={row} />
//         </DialogActions>
//       </>
//     ),

//     renderRowActions: ({ row }) => (
//       <Box sx={{ display: 'flex', gap: '0.5rem' }}>
//         <Link className="me-2 p-2 d-flex align-items-center border rounded" to="#" onClick={() => table.setEditingRow(row)}>
//           <i data-feather="edit" className="feather-edit" />
//         </Link>
//         <Link
//           data-bs-toggle="modal"
//           data-bs-target="#delete-asset-modal"
//           onClick={() => setDeleteId(row.original.id)}
//           className="me-2 p-2 d-flex align-items-center border rounded error"
//           to="#"
//         >
//           <i data-feather="trash-2" className="feather-trash-2" />
//         </Link>
//       </Box>
//     ),

//     renderTopToolbarCustomActions: ({ table }) => (
//       <Button variant="contained" onClick={() => table.setCreatingRow(true)}>
//         Add Asset
//       </Button>
//     ),

//     state: {
//       isLoading,
//       isSaving: isCreating || isUpdating || isDeleting,
//       showAlertBanner: isError || isUpdatingError || isCreatingError,
//       showProgressBars: isFetching
//     }
//   });

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <MaterialReactTable table={table} />
//       </div>

//       {/* Delete Modal */}
//       <div className="modal fade" id="delete-asset-modal">
//         <div className="modal-dialog modal-dialog-centered">
//           <div className="modal-content">
//             <div className="page-wrapper-new p-0">
//               <div className="content p-5 px-3 text-center">
//                 <span className="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2">
//                   <i className="ti ti-trash fs-24 text-danger" />
//                 </span>
//                 <h4 className="fs-20 text-gray-9 fw-bold mb-2 mt-1">Delete Asset</h4>
//                 <p className="text-gray-6 mb-0 fs-16">Are you sure you want to delete this asset?</p>
//                 <div className="modal-footer-btn mt-3 d-flex justify-content-center">
//                   <button type="button" className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">
//                     Cancel
//                   </button>
//                   <button
//                     onClick={async () => {
//                       if (deleteId) {
//                         await deleteAsset(deleteId);
//                         setDeleteId(null);
//                       }
//                     }}
//                     type="button"
//                     data-bs-dismiss="modal"
//                     className="btn btn-submit fs-13 fw-medium p-2 px-3"
//                   >
//                     Yes Delete
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // import { useMemo, useState } from 'react';
// // import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef, type MRT_TableOptions } from 'material-react-table';
// // import {
// //   useGetAccountsQuery,
// //   useGetAssetsQuery,
// //   useCreateAssetMutation
// //   // useUpdateAssetMutation,
// //   // useDeleteAssetMutation
// // } from '@core/redux/api/inventory-api';
// // import { getDefaultMRTOptions } from '@components/material-react-data-table';
// // import type { Account, Asset } from '@features/interface/features-interface';

// // const defaultMRTOptions = getDefaultMRTOptions<Asset>();

// // // Validation helpers
// // const validateRequired = (value: string) => !!value?.length;

// // function validateAsset(asset: Partial<Asset>) {
// //   return {
// //     assetTag: !validateRequired(asset.assetTag ?? '') ? 'Asset Tag is Required' : '',
// //     name: !validateRequired(asset.name ?? '') ? 'Name is Required' : '',
// //     category: !validateRequired(asset.category ?? '') ? 'Category is Required' : ''
// //   };
// // }

// // export default function AssetsTable() {
// //   const { data, isLoading } = useGetAssetsQuery();
// //   const { data: accountsData } = useGetAccountsQuery();
// //   const [createAsset] = useCreateAssetMutation();
// //   // const [updateAsset] = useUpdateAssetMutation();
// //   // const [deleteAsset] = useDeleteAssetMutation();

// //   const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

// //   const assetData = data?.data ?? [];
// //   const accounts = accountsData?.data ?? [];

// //   //  CREATE action
// //   const handleCreateAsset: MRT_TableOptions<Asset>['onCreatingRowSave'] = async ({ values, table }) => {
// //     const newValidationErrors = validateAsset(values);
// //     if (Object.values(newValidationErrors).some((e) => e)) {
// //       setValidationErrors(newValidationErrors);
// //       return;
// //     }
// //     setValidationErrors({});
// //     await createAsset({
// //       ...values
// //       // accountId: values.accountId
// //     });
// //     table.setCreatingRow(null);
// //   };

// //   //  UPDATE action
// //   const handleSaveAsset: MRT_TableOptions<Asset>['onEditingRowSave'] = async ({ values, table }) => {
// //     const newValidationErrors = validateAsset(values);
// //     if (Object.values(newValidationErrors).some((e) => e)) {
// //       setValidationErrors(newValidationErrors);
// //       return;
// //     }
// //     setValidationErrors({});
// //     alert('Asset update is currently disabled in this demo.');
// //     // await updateAsset({
// //     //   id: row.original.id,
// //     //   ...values,
// //     //   accountId: values.accountId
// //     // });
// //     table.setEditingRow(null);
// //   };

// //   //  DELETE action
// //   // const openDeleteConfirmModal = (row: MRT_Row<Asset>) => {
// //   const openDeleteConfirmModal = () => {
// //     if (window.confirm('Are you sure you want to delete this asset?')) {
// //       // deleteAsset({ id: row.original.id });
// //       alert('Asset deletion is currently disabled in this demo.');
// //     }
// //   };

// //   const columns = useMemo<MRT_ColumnDef<Asset>[]>(
// //     () => [
// //       { accessorKey: 'assetTag', header: 'Asset Tag' },
// //       { accessorKey: 'name', header: 'Name' },
// //       { accessorKey: 'category', header: 'Category' },
// //       { accessorKey: 'description', header: 'Description' },
// //       {
// //         accessorKey: 'purchaseDate',
// //         header: 'Purchase Date',
// //         muiEditTextFieldProps: {
// //           required: true,
// //           error: !!validationErrors.purchaseDate,
// //           helperText: validationErrors.purchaseDate
// //         },
// //         Cell: ({ cell }) => cell.getValue<string>() && new Date(cell.getValue<string>()).toLocaleDateString()
// //       },
// //       {
// //         accessorKey: 'purchaseCost',
// //         header: 'Cost',
// //         Cell: ({ cell }) => `KES ${cell.getValue<number>()?.toFixed(2)}`
// //       },
// //       { accessorKey: 'supplier', header: 'Supplier' },
// //       { accessorKey: 'location', header: 'Location' },
// //       { accessorKey: 'status', header: 'Status' },
// //       { accessorKey: 'depreciation', header: 'Depreciation' },
// //       { accessorKey: 'usefulLifeYears', header: 'Useful Life (Years)' },
// //       {
// //         accessorKey: 'accountId',
// //         header: 'Account',
// //         Cell: ({ cell }) => {
// //           const account = accounts.find((a: Account) => a.account_id === cell.getValue<string>());
// //           return account ? account.name : '—';
// //         },
// //         Edit: ({ cell, column, row }) => (
// //           <select
// //             value={cell.getValue<string>()}
// //             onChange={(e) => (row._valuesCache[column.id] = e.target.value)}
// //             className="border rounded px-2 py-1"
// //           >
// //             {accounts.map((acc: Account) => (
// //               <option key={acc.account_id} value={acc.account_id}>
// //                 {acc.name}
// //               </option>
// //             ))}
// //           </select>
// //         )
// //       }
// //     ],
// //     [accounts]
// //   );

// //   const table = useMaterialReactTable({
// //     ...defaultMRTOptions,
// //     columns,
// //     data: assetData,
// //     enableEditing: true,
// //     state: { isLoading },
// //     getRowId: (row) => row.id,
// //     // Hook in handlers
// //     onCreatingRowCancel: () => setValidationErrors({}),
// //     onCreatingRowSave: handleCreateAsset,
// //     onEditingRowCancel: () => setValidationErrors({}),
// //     onEditingRowSave: handleSaveAsset,
// //     renderRowActions: () => (
// //       <button onClick={() => openDeleteConfirmModal()} className="text-red-600 hover:underline">
// //         Delete
// //       </button>
// //     ),
// //     initialState: {
// //       ...defaultMRTOptions.initialState,
// //       showColumnFilters: false
// //     }
// //   });

// //   return (
// //     <div className="page-wrapper">
// //       <div className="content">
// //         <MaterialReactTable table={table} />
// //       </div>
// //     </div>
// //   );
// // }

// // //  Validation helpers
// // const validateRequired = (value: string) => !!value?.length;

// // function validateAsset(asset: Partial<Asset>) {
// //   return {
// //     assetTag: !validateRequired(asset.assetTag ?? '') ? 'Asset Tag is Required' : '',
// //     name: !validateRequired(asset.name ?? '') ? 'Name is Required' : '',
// //     category: !validateRequired(asset.category ?? '') ? 'Category is Required' : ''
// //   };
// // }

// // const defaultMRTOptions = getDefaultMRTOptions<Asset>();

// // export default function AssetsTable() {
// //   const { data, isLoading } = useGetAssetsQuery();
// //   const { data: accountsData } = useGetAccountsQuery();
// //   const [createAsset] = useCreateAssetMutation();
// //   const [updateAsset] = useUpdateAssetMutation();
// //   const [deleteAsset] = useDeleteAssetMutation();

// //   const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

// //   const assetData = data?.data ?? [];
// //   // eslint-disable-next-line react-hooks/exhaustive-deps
// //   const accounts = accountsData?.data ?? [];

// //   const columns = useMemo<MRT_ColumnDef<Asset>[]>(
// //     () => [
// //       { accessorKey: 'assetTag', header: 'Asset Tag' },
// //       { accessorKey: 'name', header: 'Name' },
// //       { accessorKey: 'category', header: 'Category' },
// //       { accessorKey: 'description', header: 'Description' },
// //       {
// //         accessorKey: 'purchaseDate',
// //         header: 'Purchase Date',
// //         Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString()
// //       },
// //       {
// //         accessorKey: 'purchaseCost',
// //         header: 'Cost',
// //         Cell: ({ cell }) => `KES ${cell.getValue<number>().toFixed(2)}`
// //       },
// //       { accessorKey: 'supplier', header: 'Supplier' },
// //       { accessorKey: 'location', header: 'Location' },
// //       { accessorKey: 'status', header: 'Status' },
// //       { accessorKey: 'depreciation', header: 'Depreciation' },
// //       { accessorKey: 'usefulLifeYears', header: 'Useful Life (Years)' },
// //       {
// //         accessorKey: 'accountId',
// //         header: 'Account',
// //         Cell: ({ cell }) => {
// //           const account = accounts.find((a: Account) => a.account_id === cell.getValue<string>());
// //           return account ? account.name : '—';
// //         },
// //         Edit: ({ cell, column, row }) => (
// //           <select
// //             value={cell.getValue<string>()}
// //             onChange={(e) => (row._valuesCache[column.id] = e.target.value)}
// //             className="border rounded px-2 py-1"
// //           >
// //             {accounts.map((acc: Account) => (
// //               <option key={acc.account_id} value={acc.account_id}>
// //                 {acc.name}
// //               </option>
// //             ))}
// //           </select>
// //         )
// //       }
// //     ],
// //     [accounts]
// //   );

// //   // CREATE action
// //   const handleCreateAsset = async ({ values, table }: { values: Asset; table: any }) => {
// //     const newValidationErrors = validateAsset(values);
// //     if (Object.values(newValidationErrors).some((e) => e)) {
// //       setValidationErrors(newValidationErrors);
// //       return;
// //     }
// //     setValidationErrors({});
// //     await createAsset({
// //       ...values,
// //       accountId: values.accountId
// //     });
// //     table.setCreatingRow(null);
// //   };
// //   //  UPDATE action
// //   const handleSaveAsset = async ({ values, row, table }: { values: Asset; row: MRT_Row<Asset>; table: any }) => {
// //     const newValidationErrors = validateAsset(values);
// //     if (Object.values(newValidationErrors).some((e) => e)) {
// //       setValidationErrors(newValidationErrors);
// //       return;
// //     }
// //     setValidationErrors({});
// //     await updateAsset({
// //       id: row.original.id,
// //       ...values,
// //       accountId: values.accountId
// //     });
// //     table.setEditingRow(null);
// //   };

// //   //  DELETE action
// //   const openDeleteConfirmModal = (row: MRT_Row<Asset>) => {
// //     if (window.confirm('Are you sure you want to delete this asset?')) {
// //       deleteAsset({ id: row.original.id });
// //     }
// //   };

// //   const table = useMaterialReactTable({
// //     ...defaultMRTOptions,
// //     columns,
// //     data: assetData,
// //     state: { isLoading },
// //     enableEditing: true,
// //     getRowId: (row) => row.id,
// //     onCreatingRowCancel: () => setValidationErrors({}),
// //     onCreatingRowSave: handleCreateAsset,
// //     onEditingRowCancel: () => setValidationErrors({}),
// //     onEditingRowSave: handleSaveAsset,
// //     renderRowActions: ({ row }) => (
// //       <button onClick={() => openDeleteConfirmModal(row)} className="text-red-600 hover:underline">
// //         Delete
// //       </button>
// //     ),
// //     initialState: {
// //       ...defaultMRTOptions.initialState,
// //       showColumnFilters: false
// //     }
// //   });

// //   return (
// //     <div className="page-wrapper">
// //       <div className="content">
// //         <MaterialReactTable table={table} />
// //       </div>
// //     </div>
// //   );
// // }
