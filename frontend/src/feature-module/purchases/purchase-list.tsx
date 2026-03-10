// import { purchaseListData } from '../../core/json/purchase-list';
// import PrimeDataTable from './components/data-table/index';
// import SearchFromApi from '../../components/data-table/search';
// import CommonDatePicker from '../../components/date-picker/common-date-picker';
// import DeleteModal from '../../components/delete-modal';
// import CommonSelect from '../../components/select/common-select';
// import TableTopHead from '../../components/table-top-head';
import CommonFooter from '../../components/footer/commonFooter';
// import { downloadImg, stockImg02 } from '../../utils/imagepath';
// import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  // useGetSupplierPricingQuery,
  useGetPurchasesQuery,
  useGetSupplierProductsQuery,
  useGetAccountsQuery,
  useGetUnitsQuery,
  useDeletePurchaseMutation,
  useUpdatePurchaseMutation
} from '@core/redux/api/inventory-api';
import type {
  // Account,

  // CreatePurchaseRequest,
  purchaseList,
  SupplierProduct
} from '../interface/features-interface';
// import type { Unit } from '@core/interface';
import { useMemo, useState } from 'react';
import CreatePurchaseListModal from './components/modals/create-purchase-list';

import {
  // MRT_EditActionButtons,
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_TableOptions,
  // type MRT_Row,
  // type MRT_TableOptions,
  useMaterialReactTable
} from 'material-react-table';
import {
  Box,
  Button,
  MenuItem,
  Typography
  // Button,
  // DialogActions,
  // DialogContent,
  // DialogTitle
  // IconButton, Tooltip
} from '@mui/material';
import EditPaymentTypeModal from './components/modals/edit-payment-type';

const PurchasesList = () => {
  // const [listData, _setListData] = useState<any[]>(purchaseListData);
  // const [currentPage, setCurrentPage] = useState<number>(1);
  // const [totalRecords, _setTotalRecords] = useState<any>(5);
  // const [rows, setRows] = useState<number>(10);
  // const [deleteId, setDeleteId] = useState<string | null>(null);
  const [purchase_id, setPurchaseId] = useState<string | null>(null);
  const [batch, setBatch] = useState<string | null>(null);
  // const [_searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  // const [selectedSupplier, setSelectedSupplier] = useState('');
  // const [selectedStatus, setSelectedStatus] = useState('');
  // const [date, setDate] = useState<Date | null>(new Date());
  const { data: supplierproductsdata } = useGetSupplierProductsQuery();
  const { data, isLoading, isFetching, isError } = useGetPurchasesQuery();
  const [deletePurchase, { isError: isDeletePurchaseError, error: deletePurchaseError }] = useDeletePurchaseMutation();
  const [updatePurchase, { isLoading: isUpdatingPurchase }] = useUpdatePurchaseMutation();

  const { data: unitsData } = useGetUnitsQuery();
  const units = unitsData?.data ?? [];
  const { data: AccountsData } = useGetAccountsQuery();
  const supplierProductsData = useMemo(() => supplierproductsdata?.data ?? [], [supplierproductsdata]);
  const Accountsdata = AccountsData?.data ?? [];
  // keep track of rows that have been edited
  const [editedPurchases, setEditedPurchases] = useState<Record<string, purchaseList>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const supplierOptions = useMemo(
    () => [
      { label: 'Select', value: '' },
      ...supplierProductsData.map((sp: SupplierProduct) => ({
        label: sp.supplier.name + sp.product.name,
        value: sp.supplier_products_id
      }))
    ],
    [supplierProductsData]
  );

  const columns = useMemo<MRT_ColumnDef<purchaseList>[]>(
    () => [
      {
        accessorKey: 'purchase_id',
        header: 'Purchase ID',
        enableEditing: false,
        enableHiding: false,
        enableSorting: false,
        enableColumnFilter: false,
        Cell: () => null
      },
      {
        accessorKey: 'account_id',
        header: 'Account',
        enableEditing: false,
        Cell: ({ row }) => {
          const account = Accountsdata.find((acc) => acc.account_id === row.original.account_id);
          const isCredit = row.original.account_id == null;
          return (
            <span
              className={`p-1 pe-2 rounded-1 fs-10 ${
                isCredit ? 'text-danger bg-danger-transparent' : 'text-success bg-success-transparent'
              }`}
            >
              <i className="ti ti-point-filled me-1 fs-11" />
              {isCredit ? 'credit' : account ? account.name : row.original.account_id}
            </span>
          );
        }
      },
      {
        accessorKey: 'arrival_date',
        header: 'Arrival Date',
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          return value ? new Date(value).toLocaleDateString() : '—';
        },
        muiEditTextFieldProps: ({ cell, row }) => {
          const currentValue = cell.getValue<string | null>();
          const today = new Date().toISOString().split('T')[0];

          return {
            type: 'date',
            size: 'small',
            InputLabelProps: { shrink: true },
            value: currentValue ? currentValue.split('T')[0] : today,
            onChange: (e) => {
              row._valuesCache[cell.column.id] = e.target.value;
              setEditedPurchases((prev) => ({
                ...prev,
                [row.id]: { ...row.original, arrival_date: new Date(e.target.value) }
              }));
            }
          };
        }
      },
      // { accessorKey: 'batch', header: 'Batch' },
      // {
      //   accessorKey: 'batch',
      //   header: 'Batch',
      //   muiEditTextFieldProps: ({ cell, row }) => ({
      //     type: 'text',
      //     required: true,
      //     error: !!validationErrors?.[cell.id],
      //     helperText: validationErrors?.[cell.id],
      //     onBlur: (event) => {
      //       const value = event.currentTarget.value.trim();

      //       // simple validation (you can make this more complex)
      //       const validationError = value === '' ? 'Batch is required' : undefined;

      //       // update validation errors
      //       setValidationErrors({
      //         ...validationErrors,
      //         [cell.id]: validationError
      //       });

      //       // store edited purchase row
      //       setEditedPurchases({
      //         ...editedPurchases,
      //         [row.id]: {
      //           ...row.original,
      //           batch: value
      //         }
      //       });
      //       if (!validationError) {
      //          handleSavePurchases();
      //       }
      //     }
      //   })
      // },

      {
        accessorKey: 'batch',
        header: 'Batch',
        muiEditTextFieldProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
          onBlur: (event) => {
            const value = event.target.value.trim();

            // Step 1: Validate
            const validationError = value === '' ? 'Batch is required' : undefined;

            // Step 2: Update validationErrors
            setValidationErrors((prev) => ({
              ...prev,
              [cell.id]: validationError
            }));

            // Step 3: Update editedPurchases state for this row
            setEditedPurchases((prev) => ({
              ...prev,
              [row.id]: {
                ...row.original,
                batch: value
              }
            }));

            // Step 4: Only save if there is no validation error
            if (!validationError) {
              // delay to ensure state updates propagate before save
              setTimeout(() => {
                handleSavePurchases();
              }, 100);
            }
          }
        })
      },
      { accessorKey: 'damaged_units', header: 'Damaged Units' },
      { accessorKey: 'discounts', header: 'Discounts' },
      {
        accessorKey: 'payment_date',
        header: 'Payment Date',
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          return value ? new Date(value).toLocaleDateString() : '—';
        },
        muiEditTextFieldProps: ({ cell, row }) => {
          const currentValue = cell.getValue<string | null>();
          const today = new Date().toISOString().split('T')[0];
          return {
            type: 'date',
            size: 'small',
            InputLabelProps: { shrink: true },
            value: currentValue ? currentValue.split('T')[0] : today,
            onChange: (e) => {
              row._valuesCache[cell.column.id] = e.target.value;
              setEditedPurchases((prev) => ({
                ...prev,
                [row.id]: { ...row.original, payment_date: new Date(e.target.value) }
              }));
            }
          };
        }
      },
      { accessorKey: 'payment_method', header: 'Payment Method', enableEditing: false },
      { accessorKey: 'payment_reference', header: 'Payment Reference' },
      {
        accessorKey: 'payment_status',
        header: 'Payment Status',
        Cell: ({ row }) => (
          <span
            className={`p-1 pe-2 rounded-1 fs-10 ${
              row.original.payment_status === 'paid'
                ? 'text-success bg-success-transparent'
                : row.original.payment_status === 'unpaid'
                  ? 'text-danger bg-danger-transparent'
                  : 'text-warning bg-warning-transparent'
            }`}
          >
            <i className="ti ti-point-filled me-1 fs-11" />
            {row.original.payment_status}
          </span>
        )
      },
      {
        accessorKey: 'payment_type',
        header: 'Payment Type',
        enableEditing: false,
        Cell: ({ row }) => (
          <span
            className={`p-1 pe-2 rounded-1 fs-10 ${
              row.original.payment_type === 'full'
                ? 'text-success bg-success-transparent'
                : row.original.payment_type === 'credit'
                  ? 'text-danger bg-danger-transparent'
                  : 'text-warning bg-warning-transparent'
            }`}
          >
            <i className="ti ti-point-filled me-1 fs-11" />
            {row.original.payment_type}
          </span>
        )
      },
      {
        accessorKey: 'purchase_cost_per_unit',
        header: 'Purchase Cost Per Unit',
        muiEditTextFieldProps: ({ cell, row }) => ({
          type: 'number',
          required: true,
          size: 'small',
          error: !!validationErrors[cell.id],
          helperText: validationErrors[cell.id],
          onBlur: (e) => {
            const value = e.target.value;
            const validationError = value === '' || Number(value) < 0 ? 'Invalid cost' : undefined;

            setValidationErrors((prev) => ({
              ...prev,
              [cell.id]: validationError
            }));

            setEditedPurchases((prev) => ({
              ...prev,
              [row.id]: { ...row.original, purchase_cost_per_unit: Number(value) }
            }));
          }
        })
      },
      {
        accessorKey: 'quantity',
        header: 'Quantity',
        muiEditTextFieldProps: ({ cell, row }) => ({
          type: 'number',
          required: true,
          size: 'small',
          error: !!validationErrors[cell.id],
          helperText: validationErrors[cell.id],
          onBlur: (e) => {
            const value = e.target.value;
            const validationError = value === '' || Number(value) < 0 ? 'Invalid quantity' : undefined;

            setValidationErrors((prev) => ({
              ...prev,
              [cell.id]: validationError
            }));

            setEditedPurchases((prev) => ({
              ...prev,
              [row.id]: { ...row.original, quantity: Number(value) }
            }));
          }
        })
      },
      { accessorKey: 'reason_for_damage', header: 'Reason For Damage' },
      {
        accessorKey: 'supplier_products_id',
        header: 'Supplier Products ID',
        muiEditTextFieldProps: {
          select: true,
          size: 'small',
          children: supplierOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))
        },
        Cell: ({ row }) => {
          const supplierProduct = supplierProductsData.find((sp) => sp.supplier_products_id === row.original.supplier_products_id);
          return (
            <span className="p-1 pe-2 rounded-1 fs-10">
              <i className="ti ti-point-filled me-1 fs-11" />
              {supplierProduct ? supplierProduct.supplier.name : row.original.supplier_products_id}
            </span>
          );
        }
      },
      { accessorKey: 'tax', header: 'Tax' },
      { accessorKey: 'total_purchase_cost', header: 'Total Purchase Cost' },
      {
        accessorKey: 'unit_id',
        header: 'Unit',
        editVariant: 'select',
        muiEditTextFieldProps: {
          select: true,
          size: 'small',
          children: units.map((u) => (
            <MenuItem key={u.unit_id} value={u.unit_id}>
              {u.short_name}
            </MenuItem>
          ))
        },
        Cell: ({ cell }) => {
          const value = cell.getValue<string | undefined>();
          const unit = units.find((u) => u.unit_id === value);
          return (
            <span className="p-1 pe-2 rounded-1 fs-10">
              <i className="ti ti-point-filled me-1 fs-11" />
              {unit ? unit.short_name : '—'}
            </span>
          );
        }
      }
    ],
    [Accountsdata, supplierProductsData, units, validationErrors, editedPurchases]
  );

  const handleSavePurchases = async () => {
    try {
      for (const [id, updated] of Object.entries(editedPurchases)) {
        // await handleSavePurchase(updated);
        console.log('saved purchases', id, updated);
      }
      setEditedPurchases({});
      setValidationErrors({});
    } catch (error) {
      console.error('Failed to save purchases:', error);
    }
  };

  // ---------- UPDATE (edit-only validation applied) ----------
  // const handleSavePurchase: MRT_TableOptions<purchaseList>['onEditingRowSave'] = async ({ values, table }) => {
  //   console.log('values are ', values);
  //   // const payload = {
  //   //   field: values.
  //   // }

  //   // const newValidationErrors = validatePurchaseForEdit(values);
  //   // if (Object.values(newValidationErrors).some(Boolean)) {
  //   //   setValidationErrors(newValidationErrors);
  //   //   return;
  //   // }
  //   // updateReset?.();
  //   // setValidationErrors({});
  //   // const payload = { ...values } as Partial<CreatePurchaseRequest>;
  //   // delete (payload as any).createdAt;
  //   // delete (payload as any).updatedAt;
  //   // try {
  //   //   await updatePurchase(payload as CreatePurchaseRequest).unwrap();
  //   //   table.setEditingRow(null);
  //   // } catch (err) {
  //   //   console.error('update error', err);
  //   // }
  // };

  // ---------- DELETE ----------
  const sethandleDeleteValuesHandler = async (values: { purchase_id: string; batch: string }) => {
    const { purchase_id, batch } = values;
    if (!purchase_id || !batch) {
      alert('purchase id or batch missing');
      return;
    }
    setBatch(batch);
    setPurchaseId(purchase_id);

    // if (!deleteId) return;
    // try {
    //   await deletePurchase(deleteId).unwrap();
    // } catch (err) {
    //   console.error('delete error', err);
    // } finally {
    //   setDeleteId(null);
    // }
  };

  const handleDelete = async () => {
    if (!batch || !purchase_id) return;
    const values = { purchase_id, batch };
    try {
      await deletePurchase(values).unwrap();
    } catch (err) {
      console.error('delete error', err);
    } finally {
      // setDeleteId(null);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: data?.data ?? [], // your purchase data
    enableEditing: true,
    // onEditingRowSave: handleSavePurchase,
    // onEditingCellChange: handleSavePurchase,
    editDisplayMode: 'cell',
    enableCellActions: true,

    enableRowActions: true,
    getRowId: (row) => row.purchase_id, // assuming batch_inventory_id is unique
    muiTableContainerProps: { sx: { minHeight: '500px' } },
    // onEditingRowCancel: () => setValidationErrors({}),
    // onEditingRowSave: handleSaveEmployee,
    renderBottomToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Button
          color="success"
          variant="contained"
          onClick={handleSavePurchases}
          disabled={Object.keys(editedPurchases).length === 0 || Object.values(validationErrors).some((error) => !!error)}
        >
          {isUpdatingPurchase ? <p>updating...</p> : 'save'}
          {Object.values(validationErrors).some((error) => !!error)}
        </Button>
        {Object.values(validationErrors).some((error) => !!error) && <Typography color="error">Fix errors before submitting</Typography>}
      </Box>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '0.5rem' }}>
        {/* <IconButton onClick={() => table.setEditingRow(row)}> */}
        <Link className="me-2 p-2 d-flex align-items-center border rounded" to="#">
          <i onClick={() => table.setEditingRow(row)} data-feather="edit" className="feather-edit" />{' '}
        </Link>

        <Link
          data-bs-toggle="modal"
          data-bs-target="#delete-purchase-modal"
          onClick={() => sethandleDeleteValuesHandler({ purchase_id: row.original.purchase_id, batch: row.original.batch })}
          className="me-2 p-2 d-flex align-items-center border rounded error"
          to="#"
        >
          <i data-feather="trash-2" className="feather-trash-2" />
        </Link>
        <Link
          data-bs-toggle="modal"
          data-bs-target="#edit-purchase-payment-type"
          className="me-2 p-2 d-flex align-items-center border rounded"
          to="#"
        >
          <i data-feather="edit" className="feather-edit-3" />{' '}
        </Link>
        <Link className="me-2 p-2 d-flex align-items-center border rounded" to="#">
          <i onClick={() => table.setEditingRow(row)} data-feather="edit" className="feather-eye" />{' '}
        </Link>
      </Box>
    ),
    muiToolbarAlertBannerProps:
      isError || isDeletePurchaseError
        ? {
            color: 'error',
            children: deletePurchaseError?.message
          }
        : undefined,
    state: {
      isLoading,
      showAlertBanner: isError || isDeletePurchaseError,
      isSaving: isUpdatingPurchase,
      showProgressBars: isFetching,
      columnVisibility: {
        purchase_id: false
      }
    }
  });

  // ---------- Table instance ----------
  // const table = useMaterialReactTable({
  //   columns,
  //   data: data?.data ?? [],
  //   createDisplayMode: 'row',
  //   editDisplayMode: 'row',
  //   enableEditing: true,
  //   getRowId: (row) => row.supplier_products_id,
  //   // muiToolbarAlertBannerProps:
  //   //   isError || isUpdatingError || isCreatingError
  //   //     ? {
  //   //         color: 'error',
  //   //         children: updateError?.message || createError?.message
  //   //       }
  //   //     : undefined,
  //   muiTableContainerProps: { sx: { minHeight: '500px' } },
  //   // onCreatingRowCancel: () => setValidationErrors({}),
  //   // onCreatingRowSave: handleCreatePurchase,
  //   onEditingRowCancel: () => setValidationErrors({}),
  //   onEditingRowSave: handleSavePurchase,

  //   renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
  //     <>
  //       <DialogTitle variant="h6">Create Purchase</DialogTitle>
  //       <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{internalEditComponents}</DialogContent>
  //       <DialogActions>
  //         <MRT_EditActionButtons table={table} row={row} />
  //       </DialogActions>
  //     </>
  //   ),

  //   renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
  //     <>
  //       <DialogTitle variant="h6">Edit Purchase</DialogTitle>
  //       <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{internalEditComponents}</DialogContent>
  //       <DialogActions>
  //         <MRT_EditActionButtons table={table} row={row} />
  //       </DialogActions>
  //     </>
  //   ),

  //   renderRowActions: ({ row, table }) => (
  //     <Box sx={{ display: 'flex', gap: '0.5rem' }}>
  //       <Link className="me-2 p-2 d-flex align-items-center border rounded" to="#" onClick={() => table.setEditingRow(row)}>
  //         <i data-feather="edit" className="feather-edit" />
  //       </Link>

  //       <Link
  //         data-bs-toggle="modal"
  //         data-bs-target="#delete-modal"
  //         onClick={() => setDeleteId(row.original.supplier_products_id)}
  //         className="me-2 p-2 d-flex align-items-center border rounded error"
  //         to="#"
  //       >
  //         <i data-feather="trash-2" className="feather-trash-2" />
  //       </Link>
  //     </Box>
  //   ),

  //   renderTopToolbarCustomActions: ({ table }) => (
  //     <Button variant="contained" onClick={() => table.setCreatingRow(true)}>
  //       Add Purchase
  //     </Button>
  //   ),

  //   state: {
  //     isLoading,
  //     // isSaving: isCreating || isUpdating || isDeleting,
  //     // showAlertBanner: isError || isUpdatingError || isCreatingError,
  //     showAlertBanner: isError,
  //     showProgressBars: isFetching
  //   }
  // });

  // If you need to auto-clear mutation flags when modal (or editing) closes, keep resets ready.
  // Example: whenever editing ends, we could call updateReset() — but be careful to call while hook mounted.
  // useEffect(() => {
  //   // subtle: when validationErrors cleared after successful update, ensure updateReset called
  //   // (optional) you can expand this logic to call createReset/updateReset when dialogs close.
  // }, [validationErrors, updateReset, createReset]);

  // const columns = [
  //   {
  //     header: 'Account',
  //     field: 'account_id',
  //     key: 'account_id',
  //     body: (row: Partial<CreatePurchaseRequest>) => {
  //       const account = Accountsdata.find((acc: Account) => acc.account_id === row.account_id);
  //       const isCredit = row.account_id == null;
  //       return (
  //         <span
  //           className={`p-1 pe-2 rounded-1 fs-10 ${isCredit ? 'text-danger bg-danger-transparent' : 'text-success bg-success-transparent'}`}
  //         >
  //           <i className="ti ti-point-filled me-1 fs-11"></i>
  //           {isCredit ? 'credit' : account ? account.name : row.account_id}
  //         </span>
  //       );
  //     }
  //   },
  //   // {
  //   //   header: 'Account',
  //   //   field: 'account_id',
  //   //   key: 'account_id',
  //   //   body: (row: Partial<CreatePurchaseRequest>) => {
  //   //     const account = Accountsdata.find((acc: Account) => acc.account_id === row.account_id);
  //   //     return (
  //   //       <span className="p-1 pe-2 rounded-1 fs-10">
  //   //         <i className="ti ti-point-filled me-1 fs-11"></i>
  //   //         {row.account_id == null ? 'credit' : account ? account.name : row.account_id}
  //   //       </span>
  //   //     );
  //   //   }
  //   // },
  //   // { header: 'Account ID', field: 'account_id', key: 'account_id' },
  //   { header: 'Arrival Date', field: 'arrival_date', key: 'arrival_date' },
  //   { header: 'Batch', field: 'batch', key: 'batch' },
  //   { header: 'Damaged Units', field: 'damaged_units', key: 'damaged_units' },
  //   { header: 'Discounts', field: 'discounts', key: 'discounts' },
  //   { header: 'Payment Date', field: 'payment_date', key: 'payment_date' },
  //   { header: 'Payment Method', field: 'payment_method', key: 'payment_method' },
  //   { header: 'Payment Reference', field: 'payment_reference', key: 'payment_reference' },
  //   // { header: 'Payment Status', field: 'payment_status', key: 'payment_status' },
  //   {
  //     header: 'Payment Status',
  //     field: 'payment_status',
  //     key: 'payment_status',
  //     body: (data: CreatePurchaseRequest) => (
  //       <span
  //         className={`p-1 pe-2 rounded-1 fs-10 ${
  //           data.payment_status === 'paid'
  //             ? 'text-success bg-success-transparent'
  //             : data.payment_status === 'unpaid'
  //               ? 'text-danger bg-danger-transparent'
  //               : 'text-warning bg-warning-transparent'
  //         }`}
  //       >
  //         <i className="ti ti-point-filled me-1 fs-11"></i>
  //         {data.payment_status}
  //       </span>
  //     )
  //   },
  //   // { header: 'Payment Type', field: 'payment_type', key: 'payment_type' },
  //   {
  //     header: 'Payment Type',
  //     field: 'payment_type',
  //     key: 'payment_type',
  //     body: (data: CreatePurchaseRequest) => (
  //       <span
  //         className={`p-1 pe-2 rounded-1 fs-10 ${
  //           data.payment_type === 'full'
  //             ? 'text-success bg-success-transparent'
  //             : data.payment_type === 'credit'
  //               ? 'text-danger bg-danger-transparent'
  //               : 'text-warning bg-warning-transparent'
  //         }`}
  //       >
  //         <i className="ti ti-point-filled me-1 fs-11"></i>
  //         {data.payment_type}
  //       </span>
  //     )
  //   },
  //   { header: 'Purchase Cost Per Unit', field: 'purchase_cost_per_unit', key: 'purchase_cost_per_unit' },
  //   { header: 'Quantity', field: 'quantity', key: 'quantity' },
  //   { header: 'Reason For Damage', field: 'reason_for_damage', key: 'reason_for_damage' },
  //   // { header: 'Supplier Products ID', field: 'supplier_products_id', key: 'supplier_products_id' },
  //   {
  //     header: 'Supplier Products ID',
  //     field: 'supplier_products_id',
  //     key: 'supplier_products_id',
  //     sortable: true,
  //     body: (row: Partial<CreatePurchaseRequest>) => {
  //       const supplierProduct = supplierProductsData.find((sp: SupplierProduct) => sp.supplier_products_id === row.supplier_products_id);
  //       return (
  //         <span className="p-1 pe-2 rounded-1 fs-10">
  //           <i className="ti ti-point-filled me-1 fs-11"></i>
  //           {supplierProduct ? supplierProduct.supplier.name : row.supplier_products_id}
  //         </span>
  //       );
  //     }
  //     // body: (rows: Partial<CreatePurchaseRequest> | Partial<SupplierProduct>) => (
  //     //   <span className={`p-1 pe-2 rounded-1 fs-10`}>
  //     //     <i className="ti ti-point-filled me-1 fs-11"></i>
  //     //     {/* {rows.supplier_products_id === rows.supplier_products_id} */}
  //     //     {JSON.stringify(rows)}
  //     //   </span>
  //     //   )
  //   },

  //   { header: 'Tax', field: 'tax', key: 'tax' },
  //   { header: 'Total Purchase Cost', field: 'total_purchase_cost', key: 'total_purchase_cost' },
  //   {
  //     header: 'Unit',
  //     field: 'unit_id',
  //     key: 'unit',
  //     body: (row: Partial<CreatePurchaseRequest>) => {
  //       const unit = units.find((u: Unit) => u.unit_id === row.unit_id);
  //       return (
  //         <span className="p-1 pe-2 rounded-1 fs-10">
  //           <i className="ti ti-point-filled me-1 fs-11"></i>
  //           {unit ? unit.short_name : row.unit_id}
  //         </span>
  //       );
  //     }
  //   }
  //   // { header: 'Unit ID', field: 'unit_id', key: 'unit_id' },
  //   // {
  //   //   header: '',
  //   //   field: 'actions',
  //   //   key: 'actions',
  //   //   sortable: false,
  //   //   body: (_row: CreatePurchaseRequest) => (
  //   //     <div className="edit-delete-action">
  //   //       <Link className="me-2 p-2" to="#">
  //   //         <i className="feather icon-eye action-eye"></i>
  //   //       </Link>
  //   //       <Link to="#" className="me-2 p-2" data-bs-toggle="modal" data-bs-target="#edit-purchase">
  //   //         <i className="feather icon-edit"></i>
  //   //       </Link>
  //   //       <Link data-bs-toggle="modal" data-bs-target="#delete-modal" className="p-2" to="#">
  //   //         <i className="feather icon-trash-2"></i>
  //   //       </Link>
  //   //     </div>
  //   //   )
  //   // }
  // ];

  // const handleSearch = (value: any) => {
  //   setSearchQuery(value);
  // };
  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header transfer">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4 className="fw-bold">Purchase</h4>
                <h6>Manage your purchases</h6>
              </div>
            </div>
            {/* <TableTopHead /> */}
            <div className="d-flex purchase-pg-btn">
              <div className="page-btn">
                <Link to="#" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-purchase">
                  <i className="me-1 feather icon-plus-circle" />
                  Add Purchase
                </Link>
              </div>
              {/* <div className="page-btn import">
                <Link to="#" className="btn btn-secondary color" data-bs-toggle="modal" data-bs-target="#view-notes">
                  <i className="feather icon-download me-2" />
                  Import Purchase
                </Link>
              </div> */}
            </div>
          </div>
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <MaterialReactTable table={table} />
              </div>
            </div>
          </div>
          {/* /product list */}
        </div>
        <CommonFooter />
      </div>

      <CreatePurchaseListModal supplierOptions={supplierOptions} Accounts={Accountsdata} unitsData={units} />

      {/* /Import Purchase */}
      {/* <DeleteModal /> */}
      <div className="modal fade" id="delete-purchase-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content p-5 px-3 text-center">
                <span className="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2">
                  <i className="ti ti-trash fs-24 text-danger" />
                </span>
                <h4 className="mb-0 delete-account-font">Are you sure you want to delete this?</h4>
                <div className="modal-footer-btn mt-3 d-flex justify-content-center">
                  <button type="button" className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  {/* <Link to="#" className="btn btn-primary fs-13 fw-medium p-2 px-3" data-bs-dismiss="modal">
                    Yes Delete
                  </Link> */}
                  <button
                    onClick={async () => {
                      if (purchase_id && batch) {
                        console.log('delete id is ', purchase_id);
                        await handleDelete();
                        // setDeleteId(null);
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
      {/* <EditPurchaseListModal supplierOptions={supplierOptions} Accounts={Accountsdata} unitsData={units} /> */}
      <EditPaymentTypeModal supplierOptions={supplierOptions} Accounts={Accountsdata} unitsData={units} />
    </>
  );
};

export default PurchasesList;

/**
 *  old code
 */

// // import { purchaseListData } from '../../core/json/purchase-list';
// import PrimeDataTable from './components/data-table/index';
// // import SearchFromApi from '../../components/data-table/search';
// import CommonDatePicker from '../../components/date-picker/common-date-picker';
// import DeleteModal from '../../components/delete-modal';
// import CommonSelect from '../../components/select/common-select';
// // import TableTopHead from '../../components/table-top-head';
// import CommonFooter from '../../components/footer/commonFooter';
// import { downloadImg, stockImg02 } from '../../utils/imagepath';
// import { useState } from 'react';
// import { Link } from 'react-router';
// import {
//   // useGetSupplierPricingQuery,
//   useGetPurchasesQuery,
//   useGetSupplierProductsQuery,
//   useGetAccountsQuery,
//   useGetUnitsQuery
// } from '@core/redux/api/inventory-api';
// import type { Account, CreatePurchaseRequest, SupplierProduct } from '../interface/features-interface';
// import type { Unit } from '@core/interface';
// import { useMemo } from 'react';
// import CreatePurchaseListModal from './components/modals/create-purchase-list';

// const PurchasesList = () => {
//   // const [listData, _setListData] = useState<any[]>(purchaseListData);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   // const [totalRecords, _setTotalRecords] = useState<any>(5);
//   const [rows, setRows] = useState<number>(10);
//   // const [_searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
//   const [selectedSupplier, setSelectedSupplier] = useState('');
//   const [selectedStatus, setSelectedStatus] = useState('');
//   const [date, setDate] = useState<Date | null>(new Date());
//   const { data: supplierproductsdata } = useGetSupplierProductsQuery();
//   const { data } = useGetPurchasesQuery();
//   const { data: unitsData } = useGetUnitsQuery();
//   const units = unitsData?.data ?? [];
//   const { data: AccountsData } = useGetAccountsQuery();
//   console.log('suppplier products are ', supplierproductsdata);
//   const supplierProductsData = useMemo(() => supplierproductsdata?.data ?? [], [supplierproductsdata]);
//   const Accountsdata = AccountsData?.data ?? [];
//   console.log('data is ', data?.data);
//   console.log('units are::::::: ', units);
//   // const {
//   //   data: SupplierPricingData,
//   //   isLoading: isPricingLoading,
//   //   isError: isPricingError,
//   //   error: pricingError
//   // } = useGetSupplierPricingQuery();

//   // console.log('supplier pricing is ', SupplierPricingData);

//   const supplierOptions = useMemo(
//     () => [
//       { label: 'Select', value: '' },
//       ...supplierProductsData.map((sp: SupplierProduct) => ({
//         label: sp.supplier.name + sp.product.name,
//         value: sp.supplier_products_id
//       }))
//     ],
//     [supplierProductsData]
//   );
//   // const supplierOptions2 = [
//   //   { label: 'Select', value: '' },
//   //   { label: 'Apex Computers', value: 'apex-computers' },
//   //   { label: 'Dazzle Shoes', value: 'dazzle-shoes' },
//   //   { label: 'Best Accessories', value: 'best-accessories' }
//   // ];

//   const statusOptions = [
//     { label: 'Select', value: '' },
//     { label: 'Received', value: 'received' },
//     { label: 'Pending', value: 'pending' }
//   ];

//   // const columns = [
//   //   {
//   //     header: (
//   //       <label className="checkboxs">
//   //         <input type="checkbox" id="select-all" />
//   //         <span className="checkmarks" />
//   //       </label>
//   //     ),
//   //     body: () => (
//   //       <label className="checkboxs">
//   //         <input type="checkbox" />
//   //         <span className="checkmarks" />
//   //       </label>
//   //     ),
//   //     sortable: false,
//   //     key: 'checked'
//   //   },
//   //   { header: 'Supplier Name', field: 'supplierName', key: 'supplierName' },
//   //   { header: 'Reference', field: 'reference', key: 'reference' },
//   //   { header: 'Date', field: 'date', key: 'date' },
//   // {
//   //   header: 'Status',
//   //   field: 'status',
//   //   key: 'status',
//   //   body: (data: any) => (
//   //     <span
//   //       className={`badges status-badge fs-10 p-1 px-2 rounded-1 ${
//   //         data.status === 'Pending' ? 'badge-pending' : data.status === 'Ordered' ? 'bg-warning' : ''
//   //       }`}
//   //     >
//   //       {data.status}
//   //     </span>
//   //   )
//   // },
//   //   { header: 'Total', field: 'total', key: 'total' },
//   //   { header: 'Paid', field: 'paid', key: 'paid' },
//   //   { header: 'Due', field: 'due', key: 'due' },
//   //   {
//   //     header: 'Payment Status',
//   //     field: 'paymentStatus',
//   //     key: 'paymentStatus',
//   //     body: (data: any) => (
//   //       <span
//   //         className={`p-1 pe-2 rounded-1 fs-10 ${
//   //           data.paymentStatus === 'Paid'
//   //             ? 'text-success bg-success-transparent'
//   //             : data.paymentStatus === 'Unpaid'
//   //               ? 'text-danger bg-danger-transparent'
//   //               : 'text-warning bg-warning-transparent'
//   //         }`}
//   //       >
//   //         <i className="ti ti-point-filled me-1 fs-11"></i>
//   //         {data.paymentStatus}
//   //       </span>
//   //     )
//   //   },
//   //   {
//   //     header: '',
//   //     field: 'actions',
//   //     key: 'actions',
//   //     sortable: false,
//   //     body: (_row: any) => (
//   //       <div className="edit-delete-action">
//   //         <Link className="me-2 p-2" to="#">
//   //           <i className="feather icon-eye action-eye"></i>
//   //         </Link>
//   //         <Link to="#" className="me-2 p-2" data-bs-toggle="modal" data-bs-target="#edit-purchase">
//   //           <i className="feather icon-edit"></i>
//   //         </Link>
//   //         <Link data-bs-toggle="modal" data-bs-target="#delete-modal" className="p-2" to="#">
//   //           <i className="feather icon-trash-2"></i>
//   //         </Link>
//   //       </div>
//   //     )
//   //   }
//   // ];

//   const columns = [
//     {
//       header: 'Account',
//       field: 'account_id',
//       key: 'account_id',
//       body: (row: Partial<CreatePurchaseRequest>) => {
//         const account = Accountsdata.find((acc: Account) => acc.account_id === row.account_id);
//         const isCredit = row.account_id == null;
//         return (
//           <span
//             className={`p-1 pe-2 rounded-1 fs-10 ${isCredit ? 'text-danger bg-danger-transparent' : 'text-success bg-success-transparent'}`}
//           >
//             <i className="ti ti-point-filled me-1 fs-11"></i>
//             {isCredit ? 'credit' : account ? account.name : row.account_id}
//           </span>
//         );
//       }
//     },
//     // {
//     //   header: 'Account',
//     //   field: 'account_id',
//     //   key: 'account_id',
//     //   body: (row: Partial<CreatePurchaseRequest>) => {
//     //     const account = Accountsdata.find((acc: Account) => acc.account_id === row.account_id);
//     //     return (
//     //       <span className="p-1 pe-2 rounded-1 fs-10">
//     //         <i className="ti ti-point-filled me-1 fs-11"></i>
//     //         {row.account_id == null ? 'credit' : account ? account.name : row.account_id}
//     //       </span>
//     //     );
//     //   }
//     // },
//     // { header: 'Account ID', field: 'account_id', key: 'account_id' },
//     { header: 'Arrival Date', field: 'arrival_date', key: 'arrival_date' },
//     { header: 'Batch', field: 'batch', key: 'batch' },
//     { header: 'Damaged Units', field: 'damaged_units', key: 'damaged_units' },
//     { header: 'Discounts', field: 'discounts', key: 'discounts' },
//     { header: 'Payment Date', field: 'payment_date', key: 'payment_date' },
//     { header: 'Payment Method', field: 'payment_method', key: 'payment_method' },
//     { header: 'Payment Reference', field: 'payment_reference', key: 'payment_reference' },
//     // { header: 'Payment Status', field: 'payment_status', key: 'payment_status' },
//     {
//       header: 'Payment Status',
//       field: 'payment_status',
//       key: 'payment_status',
//       body: (data: CreatePurchaseRequest) => (
//         <span
//           className={`p-1 pe-2 rounded-1 fs-10 ${
//             data.payment_status === 'paid'
//               ? 'text-success bg-success-transparent'
//               : data.payment_status === 'unpaid'
//                 ? 'text-danger bg-danger-transparent'
//                 : 'text-warning bg-warning-transparent'
//           }`}
//         >
//           <i className="ti ti-point-filled me-1 fs-11"></i>
//           {data.payment_status}
//         </span>
//       )
//     },
//     // { header: 'Payment Type', field: 'payment_type', key: 'payment_type' },
//     {
//       header: 'Payment Type',
//       field: 'payment_type',
//       key: 'payment_type',
//       body: (data: CreatePurchaseRequest) => (
//         <span
//           className={`p-1 pe-2 rounded-1 fs-10 ${
//             data.payment_type === 'full'
//               ? 'text-success bg-success-transparent'
//               : data.payment_type === 'credit'
//                 ? 'text-danger bg-danger-transparent'
//                 : 'text-warning bg-warning-transparent'
//           }`}
//         >
//           <i className="ti ti-point-filled me-1 fs-11"></i>
//           {data.payment_type}
//         </span>
//       )
//     },
//     { header: 'Purchase Cost Per Unit', field: 'purchase_cost_per_unit', key: 'purchase_cost_per_unit' },
//     { header: 'Quantity', field: 'quantity', key: 'quantity' },
//     { header: 'Reason For Damage', field: 'reason_for_damage', key: 'reason_for_damage' },
//     // { header: 'Supplier Products ID', field: 'supplier_products_id', key: 'supplier_products_id' },
//     {
//       header: 'Supplier Products ID',
//       field: 'supplier_products_id',
//       key: 'supplier_products_id',
//       sortable: true,
//       body: (row: Partial<CreatePurchaseRequest>) => {
//         const supplierProduct = supplierProductsData.find((sp: SupplierProduct) => sp.supplier_products_id === row.supplier_products_id);
//         return (
//           <span className="p-1 pe-2 rounded-1 fs-10">
//             <i className="ti ti-point-filled me-1 fs-11"></i>
//             {supplierProduct ? supplierProduct.supplier.name : row.supplier_products_id}
//           </span>
//         );
//       }
//       // body: (rows: Partial<CreatePurchaseRequest> | Partial<SupplierProduct>) => (
//       //   <span className={`p-1 pe-2 rounded-1 fs-10`}>
//       //     <i className="ti ti-point-filled me-1 fs-11"></i>
//       //     {/* {rows.supplier_products_id === rows.supplier_products_id} */}
//       //     {JSON.stringify(rows)}
//       //   </span>
//       //   )
//     },

//     { header: 'Tax', field: 'tax', key: 'tax' },
//     { header: 'Total Purchase Cost', field: 'total_purchase_cost', key: 'total_purchase_cost' },
//     {
//       header: 'Unit',
//       field: 'unit_id',
//       key: 'unit',
//       body: (row: Partial<CreatePurchaseRequest>) => {
//         const unit = units.find((u: Unit) => u.unit_id === row.unit_id);
//         return (
//           <span className="p-1 pe-2 rounded-1 fs-10">
//             <i className="ti ti-point-filled me-1 fs-11"></i>
//             {unit ? unit.short_name : row.unit_id}
//           </span>
//         );
//       }
//     }
//     // { header: 'Unit ID', field: 'unit_id', key: 'unit_id' },
//     // {
//     //   header: '',
//     //   field: 'actions',
//     //   key: 'actions',
//     //   sortable: false,
//     //   body: (_row: CreatePurchaseRequest) => (
//     //     <div className="edit-delete-action">
//     //       <Link className="me-2 p-2" to="#">
//     //         <i className="feather icon-eye action-eye"></i>
//     //       </Link>
//     //       <Link to="#" className="me-2 p-2" data-bs-toggle="modal" data-bs-target="#edit-purchase">
//     //         <i className="feather icon-edit"></i>
//     //       </Link>
//     //       <Link data-bs-toggle="modal" data-bs-target="#delete-modal" className="p-2" to="#">
//     //         <i className="feather icon-trash-2"></i>
//     //       </Link>
//     //     </div>
//     //   )
//     // }
//   ];

//   // const handleSearch = (value: any) => {
//   //   setSearchQuery(value);
//   // };
//   return (
//     <>
//       <div className="page-wrapper">
//         <div className="content">
//           <div className="page-header transfer">
//             <div className="add-item d-flex">
//               <div className="page-title">
//                 <h4 className="fw-bold">Purchase</h4>
//                 <h6>Manage your purchases</h6>
//               </div>
//             </div>
//             {/* <TableTopHead /> */}
//             <div className="d-flex purchase-pg-btn">
//               <div className="page-btn">
//                 <Link to="#" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-purchase">
//                   <i className="me-1 feather icon-plus-circle" />
//                   Add Purchase
//                 </Link>
//               </div>
//               {/* <div className="page-btn import">
//                 <Link to="#" className="btn btn-secondary color" data-bs-toggle="modal" data-bs-target="#view-notes">
//                   <i className="feather icon-download me-2" />
//                   Import Purchase
//                 </Link>
//               </div> */}
//             </div>
//           </div>
//           <div className="card">
//             <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
//               {/* <SearchFromApi callback={handleSearch} rows={rows} setRows={setRows} /> */}
//               {/* <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
//                 <div className="dropdown">
//                   <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
//                     Payment Status
//                   </Link>
//                   <ul className="dropdown-menu  dropdown-menu-end p-3">
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Paid
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Unpaid
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Overdue
//                       </Link>
//                     </li>
//                   </ul>
//                 </div>
//               </div> */}
//             </div>
//             <div className="card-body p-0">
//               <div className="table-responsive">
//                 <PrimeDataTable
//                   column={columns}
//                   data={data?.data}
//                   rows={rows}
//                   setRows={setRows}
//                   currentPage={currentPage}
//                   setCurrentPage={setCurrentPage}
//                   totalRecords={100}
//                 />
//               </div>
//             </div>
//           </div>
//           {/* /product list */}
//         </div>
//         <CommonFooter />
//       </div>
//       {/* Add Purchase */}
//       {/* <div className="modal fade" id="add-purchase">
//         <div className="modal-dialog purchase modal-dialog-centered">
//           <div className="modal-content">
//             <div className="modal-header">
//               <div className="page-title">
//                 <h4>Add Purchase</h4>
//               </div>
//               <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
//                 <span aria-hidden="true">×</span>
//               </button>
//             </div>
//             <form action="purchase-list.html">
//               <div className="modal-body">
//                 <div className="row">
//                   <div className="col-lg-4 col-md-6 col-sm-12">
//                     <div className="mb-3 add-product">
//                       <label className="form-label">
//                         Supplier Name<span className="text-danger ms-1">*</span>
//                       </label>
//                       <div className="row">
//                         <div className="col-lg-10 col-sm-10 col-10">
//                           <CommonSelect
//                             className="w-100"
//                             options={supplierOptions}
//                             value={selectedSupplier}
//                             onChange={(e) => setSelectedSupplier(e.value)}
//                             placeholder="Select Supplier"
//                             filter={false}
//                           />
//                         </div>
//                         <div className="col-lg-2 col-sm-2 col-2 ps-0">
//                           <div className="add-icon tab">
//                             <Link to="#" data-bs-toggle="modal" data-bs-target="#add_customer">
//                               <i className="feather icon-plus-circle" />
//                             </Link>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-lg-4 col-md-6 col-sm-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Date<span className="text-danger ms-1">*</span>
//                       </label>
//                       <div className="input-groupicon calender-input">
//                         <i className="feather icon-plus-calendar info-img" />
//                         <CommonDatePicker appendTo={'self'} value={date} onChange={setDate} className="w-100" />
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-lg-4 col-sm-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Reference<span className="text-danger ms-1">*</span>
//                       </label>
//                       <input type="text" className="form-control" />
//                     </div>
//                   </div>
//                 </div>
//                 <div className="row">
//                   <div className="col-lg-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Product<span className="text-danger ms-1">*</span>
//                       </label>
//                       <input type="text" className="form-control" placeholder="Search Product" />
//                     </div>
//                   </div>
//                   <div className="col-lg-12">
//                     <div className="modal-body-table mt-3">
//                       <div className="table-responsive">
//                         <table className="table datatable rounded-1">
//                           <thead>
//                             <tr>
//                               <th className="bg-secondary-transparent p-3">Product</th>
//                               <th className="bg-secondary-transparent p-3">Qty</th>
//                               <th className="bg-secondary-transparent p-3">Purchase Price($)</th>
//                               <th className="bg-secondary-transparent p-3">Discount($)</th>
//                               <th className="bg-secondary-transparent p-3">Tax(%)</th>
//                               <th className="bg-secondary-transparent p-3">Tax Amount($)</th>
//                               <th className="bg-secondary-transparent p-3">Unit Cost($)</th>
//                               <th className="bg-secondary-transparent p-3">Total Cost(%)</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             <tr>
//                               <td className="p-0" />
//                               <td className="p-0" />
//                               <td className="p-0" />
//                               <td className="p-0" />
//                               <td className="p-0" />
//                               <td className="p-0" />
//                               <td className="p-0" />
//                               <td className="p-0" />
//                             </tr>
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="row">
//                     <div className="col-lg-3 col-md-6 col-sm-12">
//                       <div className="mb-3">
//                         <label className="form-label">
//                           Order Tax<span className="text-danger ms-1">*</span>
//                         </label>
//                         <input type="text" className="form-control" />
//                       </div>
//                     </div>
//                     <div className="col-lg-3 col-md-6 col-sm-12">
//                       <div className="mb-3">
//                         <label className="form-label">
//                           Discount<span className="text-danger ms-1">*</span>
//                         </label>
//                         <input type="text" className="form-control" />
//                       </div>
//                     </div>
//                     <div className="col-lg-3 col-md-6 col-sm-12">
//                       <div className="mb-3">
//                         <label className="form-label">
//                           Shipping<span className="text-danger ms-1">*</span>
//                         </label>
//                         <input type="text" className="form-control" />
//                       </div>
//                     </div>
//                     <div className="col-lg-3 col-md-6 col-sm-12">
//                       <div className="mb-3">
//                         <label className="form-label">
//                           Status<span className="text-danger ms-1">*</span>
//                         </label>
//                         <CommonSelect
//                           className="w-100"
//                           options={statusOptions}
//                           value={selectedStatus}
//                           onChange={(e) => setSelectedStatus(e.value)}
//                           placeholder="Select Status"
//                           filter={false}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="col-lg-12 mt-3">
//                   <div className="mb-3 summer-description-box">
//                     <label className="form-label">Description</label>
//                     <div id="summernote" />
//                     <p className="mt-1">Maximum 60 Words</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" className="btn me-2 btn-secondary" data-bs-dismiss="modal">
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn btn-primary">
//                   Submit
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div> */}
//       <CreatePurchaseListModal supplierOptions={supplierOptions} Accounts={Accountsdata} unitsData={units} />
//       {/* /Add Purchase */}
//       {/* Add Supplier */}
//       <div className="modal fade" id="add_customer">
//         <div className="modal-dialog modal-dialog-centered">
//           <div className="modal-content">
//             <div className="modal-header">
//               <div className="page-title">
//                 <h4>Add Supplier</h4>
//               </div>
//               <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
//                 <span aria-hidden="true">×</span>
//               </button>
//             </div>
//             <form action="purchase-list.html">
//               <div className="modal-body">
//                 <div>
//                   <label className="form-label">
//                     Supplier<span className="text-danger">*</span>
//                   </label>
//                   <input type="text" className="form-control" />
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn btn-primary fs-13 fw-medium p-2 px-3">
//                   Add Supplier
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//       {/* /Add Supplier */}
//       {/* Edit Purchase */}
//       <div className="modal fade" id="edit-purchase">
//         <div className="modal-dialog purchase modal-dialog-centered">
//           <div className="modal-content">
//             <div className="modal-header">
//               <div className="page-title">
//                 <h4>Edit Purchase</h4>
//               </div>
//               <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
//                 <span aria-hidden="true">×</span>
//               </button>
//             </div>
//             <form action="purchase-list.html">
//               <div className="modal-body">
//                 <div className="row">
//                   <div className="col-lg-4 col-md-6 col-sm-12">
//                     <div className="mb-3 add-product">
//                       <label className="form-label">
//                         Supplier Name<span className="text-danger ms-1">*</span>
//                       </label>
//                       <div className="row">
//                         <div className="col-lg-10 col-sm-10 col-10">
//                           <CommonSelect
//                             className="w-100"
//                             options={supplierOptions}
//                             value={selectedSupplier}
//                             onChange={(e) => setSelectedSupplier(e.value)}
//                             placeholder="Select Supplier"
//                             filter={false}
//                           />
//                         </div>
//                         <div className="col-lg-2 col-sm-2 col-2 ps-0">
//                           <div className="add-icon tab">
//                             <Link to="#">
//                               <i className="feather icon-plus-circle" />
//                             </Link>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-lg-4 col-md-6 col-sm-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Date<span className="text-danger ms-1">*</span>
//                       </label>
//                       <div className="input-groupicon calender-input">
//                         <i className="feather icon-plus-calendar info-img" />
//                         <CommonDatePicker appendTo={'self'} value={date} onChange={setDate} className="w-100" />
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-lg-4 col-sm-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Supplier<span className="text-danger ms-1">*</span>
//                       </label>
//                       <input type="text" className="form-control" defaultValue="Elite Retail" />
//                     </div>
//                   </div>
//                 </div>
//                 <div className="row">
//                   <div className="col-lg-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Product<span className="text-danger ms-1">*</span>
//                       </label>
//                       <input type="text" className="form-control" placeholder="Search Product" />
//                     </div>
//                   </div>
//                   <div className="col-lg-12">
//                     <div className="modal-body-table">
//                       <div className="table-responsive">
//                         <table className="table">
//                           <thead>
//                             <tr>
//                               <th className="bg-secondary-transparent p-3">Product Name</th>
//                               <th className="bg-secondary-transparent p-3">QTY</th>
//                               <th className="bg-secondary-transparent p-3">Purchase Price($) </th>
//                               <th className="bg-secondary-transparent p-3">Discount($) </th>
//                               <th className="bg-secondary-transparent p-3">Tax %</th>
//                               <th className="bg-secondary-transparent p-3">Tax Amount($)</th>
//                               <th className="text-end bg-secondary-transparent p-3">Unit Cost($)</th>
//                               <th className="text-end bg-secondary-transparent p-3">Total Cost ($) </th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             <tr>
//                               <td className="p-4">
//                                 <div className="d-flex align-items-center">
//                                   <Link to="#" className="avatar avatar-md me-2">
//                                     <img src={stockImg02} alt="product" />
//                                   </Link>
//                                   <Link to="#">Nike Jordan</Link>
//                                 </div>
//                               </td>
//                               <td className="p-4">
//                                 <div className="product-quantity">
//                                   <span className="quantity-btn">
//                                     +
//                                     <i className="plus-circle feather icon-plus-circle" />
//                                   </span>
//                                   <input type="text" className="quntity-input" defaultValue={10} />
//                                   <span className="quantity-btn">
//                                     <i className="feather icon-minus-circle feather icon-search" />
//                                   </span>
//                                 </div>
//                               </td>
//                               <td className="p-4">300</td>
//                               <td className="p-4">50</td>
//                               <td className="p-4">0</td>
//                               <td className="p-4">0.00</td>
//                               <td className="p-4">300</td>
//                               <td className="p-4">600</td>
//                             </tr>
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="row">
//                   <div className="col-lg-12 float-md-right">
//                     <div className="total-order m-2 mb-3 ms-auto">
//                       <ul className="border-1 rounded-1">
//                         <li className="border-0 border-bottom">
//                           <h4 className="border-0">Order Tax</h4>
//                           <h5>$ 0.00</h5>
//                         </li>
//                         <li className="border-0 border-bottom">
//                           <h4 className="border-0">Discount</h4>
//                           <h5>$ 0.00</h5>
//                         </li>
//                         <li className="border-0 border-bottom">
//                           <h4 className="border-0">Shipping</h4>
//                           <h5>$ 0.00</h5>
//                         </li>
//                         <li className="total border-0">
//                           <h4 className="border-0">Grand Total</h4>
//                           <h5>$1800.00</h5>
//                         </li>
//                       </ul>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="row">
//                   <div className="col-lg-3 col-md-6 col-sm-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Order Tax<span className="text-danger ms-1">*</span>
//                       </label>
//                       <input type="text" className="form-control" defaultValue={0} />
//                     </div>
//                   </div>
//                   <div className="col-lg-3 col-md-6 col-sm-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Discount<span className="text-danger ms-1">*</span>
//                       </label>
//                       <input type="text" className="form-control" defaultValue={0} />
//                     </div>
//                   </div>
//                   <div className="col-lg-3 col-md-6 col-sm-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Shipping<span className="text-danger ms-1">*</span>
//                       </label>
//                       <input type="text" className="form-control" defaultValue={0} />
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
//                 <div className="row">
//                   <div className="col-lg-12">
//                     <div className="mb-3 summer-description-box">
//                       <label className="form-label">Description</label>
//                       <div id="summernote2"></div>
//                       <p className="mt-1">Maximum 60 Words</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" className="btn me-2 btn-secondary" data-bs-dismiss="modal">
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn btn-primary">
//                   Save Changes{' '}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//       {/* /Edit Purchase */}
//       {/* Import Purchase */}
//       <div className="modal fade" id="view-notes">
//         <div className="modal-dialog modal-dialog-centered">
//           <div className="modal-content">
//             <div className="page-wrapper-new p-0">
//               <div className="content">
//                 <div className="modal-header">
//                   <div className="page-title">
//                     <h4>Import Purchase</h4>
//                   </div>
//                   <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
//                     <span aria-hidden="true">×</span>
//                   </button>
//                 </div>
//                 <form action="purchase-list.html">
//                   <div className="modal-body">
//                     <div className="row">
//                       <div className="col-lg-6 col-sm-6 col-12">
//                         <div className="mb-3">
//                           <label className="form-label">
//                             Supplier Name
//                             <span className="text-danger ms-1">*</span>
//                           </label>
//                           <div className="row">
//                             <div className="col-lg-10 col-sm-10 col-10">
//                               <CommonSelect
//                                 className="w-100"
//                                 options={supplierOptions}
//                                 value={selectedSupplier}
//                                 onChange={(e) => setSelectedSupplier(e.value)}
//                                 placeholder="Select Supplier"
//                                 filter={false}
//                               />
//                             </div>
//                             <div className="col-lg-2 col-sm-2 col-2 ps-0">
//                               <div className="add-icon tab">
//                                 <Link to="#" data-bs-toggle="modal" data-bs-target="#add_customer">
//                                   <i className="feather icon-plus-circle" />
//                                 </Link>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="col-lg-6 col-sm-6 col-12">
//                         <div className="mb-3">
//                           <label className="form-label">
//                             {' '}
//                             Status<span className="text-danger ms-1">*</span>
//                           </label>
//                           <CommonSelect
//                             className="w-100"
//                             options={statusOptions}
//                             value={selectedStatus}
//                             onChange={(e) => setSelectedStatus(e.value)}
//                             placeholder="Select Status"
//                             filter={false}
//                           />
//                         </div>
//                       </div>
//                       <div className="col-lg-12 col-12">
//                         <div className="row">
//                           <div>
//                             <div className="modal-footer-btn download-file">
//                               <Link to="#" className="btn btn-submit fs-13 fw-medium">
//                                 Download Sample File
//                               </Link>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="col-lg-12">
//                         <div className="mb-3 image-upload-down">
//                           <label className="form-label"> Upload CSV File</label>
//                           <div className="image-upload download">
//                             <input type="file" />
//                             <div className="image-uploads">
//                               <img src={downloadImg} alt="img" />
//                               <h4>
//                                 Drag and drop a <span>file to upload</span>
//                               </h4>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="col-lg-4 col-sm-6 col-12">
//                         <div className="mb-3">
//                           <label className="form-label">
//                             Order Tax<span className="text-danger ms-1">*</span>
//                           </label>
//                           <input type="text" className="form-control" />
//                         </div>
//                       </div>
//                       <div className="col-lg-4 col-sm-6 col-12">
//                         <div className="mb-3">
//                           <label className="form-label">
//                             Discount<span className="text-danger ms-1">*</span>
//                           </label>
//                           <input type="text" className="form-control" />
//                         </div>
//                       </div>
//                       <div className="col-lg-4 col-sm-6 col-12">
//                         <div className="mb-3">
//                           <label className="form-label">
//                             Shipping<span className="text-danger ms-1">*</span>
//                           </label>
//                           <input type="text" className="form-control" />
//                         </div>
//                       </div>
//                       <div className="mb-3 summer-description-box transfer">
//                         <label className="form-label">Description</label>
//                         <div id="summernote3"></div>
//                         <p>Maximum 60 Characters</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="modal-footer">
//                     <button type="button" className="btn me-2 btn-secondary" data-bs-dismiss="modal">
//                       Cancel
//                     </button>
//                     <button type="submit" className="btn btn-primary">
//                       Submit
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* /Import Purchase */}
//       <DeleteModal />
//     </>
//   );
// };

// export default PurchasesList;
