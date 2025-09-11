import { useMemo, useState } from 'react';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef, type MRT_TableOptions } from 'material-react-table';
import {
  useGetAccountsQuery,
  useGetAssetsQuery,
  useCreateAssetMutation
  // useUpdateAssetMutation,
  // useDeleteAssetMutation
} from '@core/redux/api/inventory-api';
import { getDefaultMRTOptions } from '@components/material-react-data-table';
import type { Account, Asset } from '@features/interface/features-interface';

const defaultMRTOptions = getDefaultMRTOptions<Asset>();

// Validation helpers
const validateRequired = (value: string) => !!value?.length;

function validateAsset(asset: Partial<Asset>) {
  return {
    assetTag: !validateRequired(asset.assetTag ?? '') ? 'Asset Tag is Required' : '',
    name: !validateRequired(asset.name ?? '') ? 'Name is Required' : '',
    category: !validateRequired(asset.category ?? '') ? 'Category is Required' : ''
  };
}

export default function AssetsTable() {
  const { data, isLoading } = useGetAssetsQuery();
  const { data: accountsData } = useGetAccountsQuery();
  const [createAsset] = useCreateAssetMutation();
  // const [updateAsset] = useUpdateAssetMutation();
  // const [deleteAsset] = useDeleteAssetMutation();

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const assetData = data?.data ?? [];
  const accounts = accountsData?.data ?? [];

  //  CREATE action
  const handleCreateAsset: MRT_TableOptions<Asset>['onCreatingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateAsset(values);
    if (Object.values(newValidationErrors).some((e) => e)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createAsset({
      ...values
      // accountId: values.accountId
    });
    table.setCreatingRow(null);
  };

  //  UPDATE action
  const handleSaveAsset: MRT_TableOptions<Asset>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateAsset(values);
    if (Object.values(newValidationErrors).some((e) => e)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    alert('Asset update is currently disabled in this demo.');
    // await updateAsset({
    //   id: row.original.id,
    //   ...values,
    //   accountId: values.accountId
    // });
    table.setEditingRow(null);
  };

  //  DELETE action
  // const openDeleteConfirmModal = (row: MRT_Row<Asset>) => {
  const openDeleteConfirmModal = () => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      // deleteAsset({ id: row.original.id });
      alert('Asset deletion is currently disabled in this demo.');
    }
  };

  const columns = useMemo<MRT_ColumnDef<Asset>[]>(
    () => [
      { accessorKey: 'assetTag', header: 'Asset Tag' },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'category', header: 'Category' },
      { accessorKey: 'description', header: 'Description' },
      {
        accessorKey: 'purchaseDate',
        header: 'Purchase Date',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors.purchaseDate,
          helperText: validationErrors.purchaseDate
        },
        Cell: ({ cell }) => cell.getValue<string>() && new Date(cell.getValue<string>()).toLocaleDateString()
      },
      {
        accessorKey: 'purchaseCost',
        header: 'Cost',
        Cell: ({ cell }) => `KES ${cell.getValue<number>()?.toFixed(2)}`
      },
      { accessorKey: 'supplier', header: 'Supplier' },
      { accessorKey: 'location', header: 'Location' },
      { accessorKey: 'status', header: 'Status' },
      { accessorKey: 'depreciation', header: 'Depreciation' },
      { accessorKey: 'usefulLifeYears', header: 'Useful Life (Years)' },
      {
        accessorKey: 'accountId',
        header: 'Account',
        Cell: ({ cell }) => {
          const account = accounts.find((a: Account) => a.account_id === cell.getValue<string>());
          return account ? account.name : '—';
        },
        Edit: ({ cell, column, row }) => (
          <select
            value={cell.getValue<string>()}
            onChange={(e) => (row._valuesCache[column.id] = e.target.value)}
            className="border rounded px-2 py-1"
          >
            {accounts.map((acc: Account) => (
              <option key={acc.account_id} value={acc.account_id}>
                {acc.name}
              </option>
            ))}
          </select>
        )
      }
    ],
    [accounts]
  );

  const table = useMaterialReactTable({
    ...defaultMRTOptions,
    columns,
    data: assetData,
    enableEditing: true,
    state: { isLoading },
    getRowId: (row) => row.id,
    // ✅ Hook in handlers
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateAsset,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveAsset,
    renderRowActions: () => (
      <button onClick={() => openDeleteConfirmModal()} className="text-red-600 hover:underline">
        Delete
      </button>
    ),
    initialState: {
      ...defaultMRTOptions.initialState,
      showColumnFilters: false
    }
  });

  return (
    <div className="page-wrapper">
      <div className="content">
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
}

// //  Validation helpers
// const validateRequired = (value: string) => !!value?.length;

// function validateAsset(asset: Partial<Asset>) {
//   return {
//     assetTag: !validateRequired(asset.assetTag ?? '') ? 'Asset Tag is Required' : '',
//     name: !validateRequired(asset.name ?? '') ? 'Name is Required' : '',
//     category: !validateRequired(asset.category ?? '') ? 'Category is Required' : ''
//   };
// }

// const defaultMRTOptions = getDefaultMRTOptions<Asset>();

// export default function AssetsTable() {
//   const { data, isLoading } = useGetAssetsQuery();
//   const { data: accountsData } = useGetAccountsQuery();
//   const [createAsset] = useCreateAssetMutation();
//   const [updateAsset] = useUpdateAssetMutation();
//   const [deleteAsset] = useDeleteAssetMutation();

//   const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

//   const assetData = data?.data ?? [];
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   const accounts = accountsData?.data ?? [];

//   const columns = useMemo<MRT_ColumnDef<Asset>[]>(
//     () => [
//       { accessorKey: 'assetTag', header: 'Asset Tag' },
//       { accessorKey: 'name', header: 'Name' },
//       { accessorKey: 'category', header: 'Category' },
//       { accessorKey: 'description', header: 'Description' },
//       {
//         accessorKey: 'purchaseDate',
//         header: 'Purchase Date',
//         Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString()
//       },
//       {
//         accessorKey: 'purchaseCost',
//         header: 'Cost',
//         Cell: ({ cell }) => `KES ${cell.getValue<number>().toFixed(2)}`
//       },
//       { accessorKey: 'supplier', header: 'Supplier' },
//       { accessorKey: 'location', header: 'Location' },
//       { accessorKey: 'status', header: 'Status' },
//       { accessorKey: 'depreciation', header: 'Depreciation' },
//       { accessorKey: 'usefulLifeYears', header: 'Useful Life (Years)' },
//       {
//         accessorKey: 'accountId',
//         header: 'Account',
//         Cell: ({ cell }) => {
//           const account = accounts.find((a: Account) => a.account_id === cell.getValue<string>());
//           return account ? account.name : '—';
//         },
//         Edit: ({ cell, column, row }) => (
//           <select
//             value={cell.getValue<string>()}
//             onChange={(e) => (row._valuesCache[column.id] = e.target.value)}
//             className="border rounded px-2 py-1"
//           >
//             {accounts.map((acc: Account) => (
//               <option key={acc.account_id} value={acc.account_id}>
//                 {acc.name}
//               </option>
//             ))}
//           </select>
//         )
//       }
//     ],
//     [accounts]
//   );

//   // CREATE action
//   const handleCreateAsset = async ({ values, table }: { values: Asset; table: any }) => {
//     const newValidationErrors = validateAsset(values);
//     if (Object.values(newValidationErrors).some((e) => e)) {
//       setValidationErrors(newValidationErrors);
//       return;
//     }
//     setValidationErrors({});
//     await createAsset({
//       ...values,
//       accountId: values.accountId
//     });
//     table.setCreatingRow(null);
//   };
//   //  UPDATE action
//   const handleSaveAsset = async ({ values, row, table }: { values: Asset; row: MRT_Row<Asset>; table: any }) => {
//     const newValidationErrors = validateAsset(values);
//     if (Object.values(newValidationErrors).some((e) => e)) {
//       setValidationErrors(newValidationErrors);
//       return;
//     }
//     setValidationErrors({});
//     await updateAsset({
//       id: row.original.id,
//       ...values,
//       accountId: values.accountId
//     });
//     table.setEditingRow(null);
//   };

//   // ✅ DELETE action
//   const openDeleteConfirmModal = (row: MRT_Row<Asset>) => {
//     if (window.confirm('Are you sure you want to delete this asset?')) {
//       deleteAsset({ id: row.original.id });
//     }
//   };

//   const table = useMaterialReactTable({
//     ...defaultMRTOptions,
//     columns,
//     data: assetData,
//     state: { isLoading },
//     enableEditing: true,
//     getRowId: (row) => row.id,
//     onCreatingRowCancel: () => setValidationErrors({}),
//     onCreatingRowSave: handleCreateAsset,
//     onEditingRowCancel: () => setValidationErrors({}),
//     onEditingRowSave: handleSaveAsset,
//     renderRowActions: ({ row }) => (
//       <button onClick={() => openDeleteConfirmModal(row)} className="text-red-600 hover:underline">
//         Delete
//       </button>
//     ),
//     initialState: {
//       ...defaultMRTOptions.initialState,
//       showColumnFilters: false
//     }
//   });

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <MaterialReactTable table={table} />
//       </div>
//     </div>
//   );
// }
