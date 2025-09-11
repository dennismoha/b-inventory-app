import { useState, useMemo } from 'react';
import { Button, MenuItem } from '@mui/material';
import {
  type LiteralUnion,
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_TableOptions,
  useMaterialReactTable
} from 'material-react-table';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
import {
  // useGetSupplierProductsQuery,
  useGetInventoryItemsQuery,
  useCreateInventoryItemMutation,
  // useUpdateInventoryItemMutation,
  // useDeleteInventoryItemMutation,
  useGetBatchInventoriesQuery,
  useGetUnitsQuery
} from '@core/redux/api/inventory-api'; // Assuming you have these API hooks set up;

import type { InventoryItems } from '../interface/features-interface';

// import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CommonFooter from '@components/footer/commonFooter';

const InventoryManagement = () => {
  // Fetch inventory items data
  const { data: InventoryItemsData, isLoading} = useGetInventoryItemsQuery();

  const { data: BatchInventory } = useGetBatchInventoriesQuery();

  console.log('Batch inventory dta', BatchInventory);

  // Fetch units data
  const { data: UnitsData } = useGetUnitsQuery();

  // Fetch supplier products data
  // const { data: SupplierProductsData } = useGetSupplierProductsQuery();

  // Validation state (for handling form errors, etc.)
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // Mutation hooks for updating, creating, and deleting inventory items
  // const [
  //   updateInventoryItem,
  //   { isError: updatingIsInventoryError, error: updatingInventoryError, isSuccess: updatedInventorySuccessMessage }
  // ] = useUpdateInventoryItemMutation();

  const [createInventoryItem, { isError: inventoryCreationMutationError, error: inventoryCreationMutationErrorMessage }] =
    useCreateInventoryItemMutation();

  // const [deleteInventoryItem, { isError: deletingInventoryError, error: deletingInventoryErrorMessage }] = useDeleteInventoryItemMutation();

  const batchInventory = BatchInventory?.data ?? [];
  console.log('batch inventory is ', batchInventory);
  // useEffect(() => {
  //   // Handling Inventory Items Query state
  //   if (isLoading) {
  //     toast.info('Fetching inventory items...');
  //   }

  //   if (InventoryItemsSuccessMessage) {
  //     toast.success('Inventory items fetched successfully!');
  //   }

  //   if (isError) {
  //     toast.error(`Error fetching inventory items: ${JSON.stringify(inventoryItemsError)}`);
  //   }

  //   // Handling Units Query state
  //   if (unitDataLoading) {
  //     toast.info('Fetching units data...');
  //   }

  //   if (unitDataError) {
  //     toast.error(`Error fetching units data: ${JSON.stringify(unitsError)}`);
  //   }

  //   // Handling Supplier Products Query state
  //   if (SupplierProductsData && !isLoading) {
  //     toast.info('Supplier products fetched successfully.');
  //   }

  //   // Handling Update Inventory Mutation state
  //   // if (updatingIsInventoryError) {
  //   //   toast.error(`Error updating inventory item: ${JSON.stringify(updatingInventoryError)}`);
  //   // }

  //   // if (updatedInventorySuccessMessage) {
  //   //   toast.success('Inventory item updated successfully!');
  //   // }

  //   // Handling Create Inventory Mutation state
  //   if (inventoryCreationMutationError) {
  //     toast.error(`Error creating inventory item: ${JSON.stringify(inventoryCreationMutationErrorMessage)}`);
  //   }

  //   // Handling Delete Inventory Mutation state
  //   // if (deletingInventoryError) {
  //   //   toast.error(`Error deleting inventory item: ${JSON.stringify(deletingInventoryErrorMessage)}`);
  //   // }
  // }, [isLoading, InventoryItemsSuccessMessage, isError, inventoryItemsError, unitDataLoading, unitDataError, unitsError, SupplierProductsData, inventoryCreationMutationError, inventoryCreationMutationErrorMessage]);

  const inventoryItemsData = InventoryItemsData?.data || [];
  console.log('inventory items data is ', inventoryItemsData);

  const unitsData = UnitsData?.data || [];

  // const supplierProductsData = SupplierProductsData?.data || [];

  const columns = useMemo<MRT_ColumnDef<InventoryItems>[]>(
    () => [
      {
        accessorKey: 'inventoryId',
        header: 'Inventory Item ID',
        size: 150,
        enableEditing: false,
        muiTableHeadCellProps: { style: { color: 'green' } }, //custom props
        visibleInShowHideMenu: true
      },
      {
        accessorKey: 'supplier_products_id',
        header: 'Supplier Product ID',
        size: 200,
        enableEditing: false
      },
      {
        accessorKey: 'batch_inventory_id',
        header: 'batch_inventory_id',
        enableHiding: true,
        size: 150,
        muiEditTextFieldProps: {
          required: true,
          select: true,
          children: batchInventory?.map((batch) => (
            <MenuItem key={batch.batch} value={batch.batch}>
              {batch.batch}- {`${batch.productName}`}
            </MenuItem>
          )),
          error: !!validationErrors?.batch_name,
          helperText: validationErrors?.batch_name,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              batch_name: undefined
            })
        },
        Cell: ({ cell, row }) => {
          const batchdata = batchInventory.find((batch) => batch.batchInventory === cell.getValue());
          return <div>{batchdata ? `${batchdata.batch} ` : `${JSON.stringify(row)}`}</div>;
        }
      },
      // {
      //   accessorKey: 'supplier_products_id',
      //   header: 'product Name',
      //   enableHiding: true,
      //   size: 150,
      //   muiEditTextFieldProps: {
      //     required: true,
      //     select: true,
      //     children: supplierProductsData?.map((supplierproduct) => (
      //       <MenuItem key={supplierproduct.supplier_products_id} value={supplierproduct.supplier_products_id}>
      //         {`${supplierproduct.supplier?.name} - ${supplierproduct.product?.name}`}
      //       </MenuItem>
      //     )),
      //     error: !!validationErrors?.supplier_products_id,
      //     helperText: validationErrors?.supplier_products_id,
      //     onFocus: () =>
      //       setValidationErrors({
      //         ...validationErrors,
      //         supplier_products_id: undefined
      //       })
      //   },
      //   Cell: ({ cell }) => {
      //     const suppliercellData = supplierProductsData.find((supplierCell) => supplierCell.supplier_products_id === cell.getValue());
      //     return (
      //       <div>
      //         {suppliercellData ? `${suppliercellData.supplier?.name} - ${suppliercellData.product?.name}` : 'No Supplier Product Found'}
      //       </div>
      //     );
      //   }
      // },

      {
        accessorKey: 'name',
        header: 'Product name',
        size: 200,
        enableEditing: false
      },
      // {
      //   // accessorKey: "supplierProduct?.product_id",
      //   accessorFn: (row) => row.supplierProduct?.product?.sku,
      //   header: 'SKU',
      //   size: 150,
      //   enableEditing: false
      // },

      {
        accessorKey: 'stock_quantity',
        header: 'Stock Quantity',
        size: 150,
        enableEditing: false
        // muiEditTextFieldProps: {
        //   required: true,
        //   error: !!validationErrors?.stock_quantity,
        //   helperText: validationErrors?.stock_quantity,
        //   onFocus: () =>
        //     setValidationErrors({
        //       ...validationErrors,
        //       stock_quantity: undefined
        //     })
        // }
      },
      // {
      //   accessorKey: 'product_weight',
      //   header: 'product weight',
      //   enableEditing: false
      // },
      {
        accessorKey: 'unit_id',
        header: 'Unit',
        size: 100,
        enableEditing: false,
        muiEditTextFieldProps: {
          select: true,
          children: unitsData.map((unit) => (
            <MenuItem key={unit.unit_id} value={unit.unit_id}>
              {unit.short_name}
            </MenuItem>
          )),
          error: !!validationErrors?.unit_id,
          helperText: validationErrors?.unit_id,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              unit_id: undefined
            })
        },
        Cell: ({ cell }) => {
          const unit = unitsData.find((unit) => unit.unit_id === cell.getValue());
          return <div>{unit ? unit.short_name : 'No Unit'}</div>;
        }
      },
      // {
      //   accessorKey: 'reorder_level',
      //   header: 'Reorder Level',
      //   size: 150,
      //   muiEditTextFieldProps: {
      //     required: true,
      //     error: !!validationErrors?.reorder_level,
      //     helperText: validationErrors?.reorder_level,
      //     onFocus: () =>
      //       setValidationErrors({
      //         ...validationErrors,
      //         reorder_level: undefined
      //       })
      //   }
      // },
      // {
      //   accessorKey: 'last_restocked',
      //   header: 'Last Restocked',
      //   enableEditing: false,
      //   size: 200,
      //   Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleDateString()
      // },

      {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
        enableEditing: false
      }
      // {
      //   accessorKey: 'created_at',
      //   header: 'Created At',
      //   size: 200,
      //   Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleDateString(),
      //   enableEditing: false
      // },
      // {
      //   accessorKey: 'updated_at',
      //   header: 'Updated At',
      //   size: 200,
      //   Cell: ({ cell }) => {
      //     const value = cell.getValue();
      //     return value ? new Date(value).toLocaleDateString() : '';
      //   },
      //   enableEditing: false
      // }
    ],
    [BatchInventory, validationErrors, unitsData]
  );

  // Handle creating a new row (Add New Inventory Item)
  const handleCreateInventoryItem: MRT_TableOptions<InventoryItems>['onCreatingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateInventoryItem(values);

    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      console.log('validation errors ', newValidationErrors);
      return;
    }

    setValidationErrors({});
    values = { ...values, batch_name: values.batch_inventory_id };
    console.log('here again');

    delete values.batch_inventory_id;
    delete values.created_at;
    delete values.name;
    delete values.status;
    delete values.stock_quantity;
    delete values.supplier_products_id;
    delete values.unit_id;
    delete values.updated_at;
    delete values.inventoryId;

    await createInventoryItem(values);
    table.setCreatingRow(null);
  };

  // Handle updating an existing row
  // const handleSaveInventoryItem: MRT_TableOptions<InventoryItem>['onEditingRowSave'] = async ({ values, table }) => {
  //   const newValidationErrors = validateInventoryItem(values);
  //   if (Object.values(newValidationErrors).some((error) => error)) {
  //     setValidationErrors(newValidationErrors);
  //     return;
  //   }

  //   setValidationErrors({});
  //   values = { ...values };
  //   delete values.SKU;
  //   delete values.product_name;
  //   delete values.product_weight;
  //   delete values.last_restocked;
  //   delete values.status;
  //   delete values.created_at;
  //   // delete values.updated_at;
  //   delete values.updated_at;

  //   await updateInventoryItem(values);
  //   table.setEditingRow(null);
  // };

  // // Handle deleting a row
  // const handleDelete = async (row: InventoryItem) => {
  //   const confirmed = window.confirm('Are you sure you want to delete this inventory item?');
  //   if (confirmed) {
  //     await deleteInventoryItem({ inventory_item_id: row.inventoryId });
  //   }
  // };

  const table = useMaterialReactTable({
    columns,
    data: inventoryItemsData,
    createDisplayMode: 'row',
    // editDisplayMode: 'row',
    renderRowActions: () => null,
    enableEditing: true,
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateInventoryItem,
    // onEditingRowCancel: () => setValidationErrors({}),
    // onEditingRowSave: handleSaveInventoryItem,
    getRowId: (row) => row.inventoryId,
    // renderRowActions: ({ row, table }) => (
    //   <Box sx={{ display: 'flex', gap: '1rem' }}>
    //     <Tooltip title="Edit">
    //       <IconButton onClick={() => table.setEditingRow(row)}>
    //         <EditIcon />
    //       </IconButton>
    //     </Tooltip>
    //     <Tooltip title="Delete">
    //       <IconButton color="error" onClick={() => handleDelete(row.original)}>
    //         <DeleteIcon />
    //       </IconButton>
    //     </Tooltip>
    //   </Box>
    // ),
    muiToolbarAlertBannerProps: inventoryCreationMutationError
      ? {
          color: 'error',
          children: JSON.stringify(inventoryCreationMutationErrorMessage.message)
        }
      : undefined,
    muiTableProps: {
      sx: {
        border: '1px solid #F7F7F7',
        fontSize: '14px',
        color: '#646bB72',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: '400',

        borderRadius: '10px'
      }
    },
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: '#F7F7F7',
        fontWeight: '400',
        color: '#646B72',
        fontFamily: 'Nunito, sans-serif'
      }
    },
    muiTableBodyCellProps: {
      sx: {
        // border: '2px solid rgba(81, 81, 81, .5)',

        fontSize: '14px',
        color: '#646bB72',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: '400'
      }
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true); // Open the create row form
        }}
      >
        Add New Inventory Item
      </Button>
    ),
    state: {
      isLoading,
      showAlertBanner: inventoryCreationMutationError
    }
  });

  // Validation function
  const validateInventoryItem = (
    values: Record<
      LiteralUnion<string>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    >
  ) => {
    const errors: Record<string, string | undefined> = {};

    // if (!values.stock_quantity) errors.stock_quantity = 'Quantity is required';
    if (!values.batch_inventory_id) errors.batch_inventory_id = 'batch name is required';
    // if (!values.unit_id) errors.unit_id = 'Unit is required';
    // if (!values.reorder_level) errors.reorder_level = 're-order is required';
    return errors;
  };

  // const errorMessage = null;

  // Handle error cases based on the error type
  // if (updatingInventoryError) {
  //   if ('status' in updatingInventoryError) {
  //     // If it's a FetchBaseQueryError, you can access all its properties
  //     const errorData = updatingInventoryError.data as { message: string };
  //     errorMessage = 'error' in updatingInventoryError ? updatingInventoryError.error : <div>{errorData.message as unknown as string}</div>;
  //   } else {
  //     // If it's a SerializedError, handle it separately
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     errorMessage = updatingInventoryError.message;
  //   }
  // }

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-title">
          <h4 className="fw-bold">Inventory</h4>
          <h6>Manage your inventory</h6>

          {/* <TableTopHead /> */}
        </div>

        <div className="card table-list-card">
          <div className="card-body">
            <MaterialReactTable table={table} />
          </div>
        </div>
      </div>
      <CommonFooter />
    </div>
    //   <Box sx={{ padding: 2 }}>
    //     <div>{unitDataLoading ? <div> units loading... </div> : null}</div>
    //     {/* {inventoryMutationError ?  <div>{inventoryMutationError.message}</div>:  <div>heyy</div>} */}
    //     {/* {: null} */}
    //     {updatingIsInventoryError && errorMessage ? <div style={{ color: 'red', marginBottom: '20px' }}>{errorMessage}</div> : null}

    //     <MaterialReactTable table={table} />
    //   </Box>
  );
};

export default InventoryManagement;

// import PrimeDataTable from '../../components/data-table';
// import SearchFromApi from '../../components/data-table/search';
// import DeleteModal from '../../components/delete-modal';
// import { useState } from 'react';
// import { Link } from 'react-router';
// import { stockData } from '../../core/json/stock-data';
// import TableTopHead from '../../components/table-top-head';
// import { stockImg02 } from '../../utils/imagepath';
// import CommonSelect from '../../components/select/common-select';
// import CommonFooter from '../../components/footer/commonFooter';

// const ManageStock = () => {
//   const [listData, _setListData] = useState<any[]>(stockData);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [totalRecords, _setTotalRecords] = useState<any>(5);
//   const [rows, setRows] = useState<number>(10);
//   const [_searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
//   const [selectedWarehouse, setSelectedWarehouse] = useState(null);
//   const [selectedStore, setSelectedStore] = useState(null);
//   const [selectedPerson, setSelectedPerson] = useState(null);

//   const warehouseOptions = [
//     { label: 'Lavish Warehouse', value: 'lavish' },
//     { label: 'Quaint Warehouse', value: 'quaint' },
//     { label: 'Traditional Warehouse', value: 'traditional' },
//     { label: 'Cool Warehouse', value: 'cool' }
//   ];

//   const storeOptions = [
//     { label: 'Electro Mart', value: 'electro' },
//     { label: 'Quantum Gadgets', value: 'quantum' },
//     { label: 'Prime Bazaar', value: 'prime' },
//     { label: 'Gadget World', value: 'gadget' }
//   ];

//   const personOptions = [
//     { label: 'James Kirwin', value: 'james' },
//     { label: 'Francis Chang', value: 'francis' },
//     { label: 'Steven', value: 'steven' },
//     { label: 'Gravely', value: 'gravely' }
//   ];
//   const columns = [
//     {
//       header: (
//         <label className="checkboxs">
//           <input type="checkbox" id="select-all" />
//           <span className="checkmarks" />
//         </label>
//       ),
//       body: () => {
//         return (
//           <label className="checkboxs">
//             <input type="checkbox" />
//             <span className="checkmarks" />
//           </label>
//         );
//       },
//       sortable: false
//     },
//     { header: 'Warehouse', field: 'warehouse', key: 'warehouse' },
//     { header: 'Store', field: 'store', key: 'store' },
//     {
//       header: 'Product',
//       field: 'product',
//       key: 'product',
//       body: (data: any) => (
//         <div className="d-flex align-items-center">
//           <Link to="#" className="avatar avatar-md me-2">
//             <img src={data?.product?.image} alt="product" />
//           </Link>
//           <Link to="#">Lenovo IdeaPad 3</Link>
//         </div>
//       )
//     },
//     { header: 'Date', field: 'date', key: 'date' },
//     {
//       header: 'Person',
//       field: 'person',
//       key: 'person',
//       body: (data: any) => (
//         <div className="d-flex align-items-center">
//           <Link to="#" className="avatar avatar-md me-2">
//             <img src={data?.person?.image} alt="product" />
//           </Link>
//           <Link to="#">James Kirwin</Link>
//         </div>
//       )
//     },
//     { header: 'Qty', field: 'qty', key: 'qty' },
//     {
//       header: '',
//       field: 'actions',
//       key: 'actions',
//       sortable: false,
//       body: (_row: any) => (
//         <div className="d-flex align-items-center edit-delete-action">
//           <Link className="me-2 border rounded d-flex align-items-center p-2" to="#" data-bs-toggle="modal" data-bs-target="#edit-stock">
//             <i className="feather icon-edit" />
//           </Link>
//           <Link className="p-2 border rounded d-flex align-items-center" to="#" data-bs-toggle="modal" data-bs-target="#delete-modal">
//             <i className="feather icon-trash-2" />
//           </Link>
//         </div>
//       )
//     }
//   ];

//   const handleSearch = (value: any) => {
//     setSearchQuery(value);
//   };

//   return (
//     <>
//       {' '}
//       <div className="page-wrapper">
//         <div className="content">
//           <div className="page-header">
//             <div className="add-item d-flex">
//               <div className="page-title">
//                 <h4>Manage Stock</h4>
//                 <h6>Manage your stock</h6>
//               </div>
//             </div>
//             <TableTopHead />
//             <div className="page-btn">
//               <Link to="#" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-stock">
//                 <i className="ti ti-circle-plus me-1" />
//                 Add Stock
//               </Link>
//             </div>
//           </div>
//           {/* /product list */}
//           <div className="card">
//             <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
//               <SearchFromApi callback={handleSearch} rows={rows} setRows={setRows} />
//               <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
//                 <div className="dropdown me-2">
//                   <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
//                     Warehouse
//                   </Link>
//                   <ul className="dropdown-menu  dropdown-menu-end p-3">
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Lavish Warehouse
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Quaint Warehouse{' '}
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Traditional Warehouse
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Cool Warehouse
//                       </Link>
//                     </li>
//                   </ul>
//                 </div>
//                 <div className="dropdown me-2">
//                   <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
//                     Store
//                   </Link>
//                   <ul className="dropdown-menu  dropdown-menu-end p-3">
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Electro Mart
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Quantum Gadgets
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Prime Bazaar
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Gadget World
//                       </Link>
//                     </li>
//                   </ul>
//                 </div>
//                 <div className="dropdown">
//                   <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
//                     Product
//                   </Link>
//                   <ul className="dropdown-menu  dropdown-menu-end p-3">
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Lenovo IdeaPad 3
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Beats Pro{' '}
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Nike Jordan
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Apple Series 5 Watch
//                       </Link>
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//             <div className="card-body p-0">
//               <div className="table-responsive">
//                 <PrimeDataTable
//                   column={columns}
//                   data={listData}
//                   rows={rows}
//                   setRows={setRows}
//                   currentPage={currentPage}
//                   setCurrentPage={setCurrentPage}
//                   totalRecords={totalRecords}
//                 />
//               </div>
//             </div>
//           </div>
//           {/* /product list */}
//         </div>
//         <CommonFooter />
//       </div>
//       {/* Add Stock */}
//       <div className="modal fade" id="add-stock">
//         <div className="modal-dialog modal-dialog-centered stock-adjust-modal">
//           <div className="modal-content">
//             <div className="modal-header">
//               <div className="page-title">
//                 <h4>Add Stock</h4>
//               </div>
//               <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
//                 <span aria-hidden="true">×</span>
//               </button>
//             </div>
//             <form>
//               <div className="modal-body">
//                 <div className="row">
//                   <div className="col-lg-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Warehouse <span className="text-danger ms-1">*</span>
//                       </label>
//                       <CommonSelect
//                         className="w-100"
//                         options={warehouseOptions}
//                         value={selectedWarehouse}
//                         onChange={(e) => setSelectedWarehouse(e.value)}
//                         placeholder="Select Warehouse"
//                         filter={false}
//                       />
//                     </div>
//                   </div>
//                   <div className="col-lg-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Store <span className="text-danger ms-1">*</span>
//                       </label>
//                       <CommonSelect
//                         className="w-100"
//                         options={storeOptions}
//                         value={selectedStore}
//                         onChange={(e) => setSelectedStore(e.value)}
//                         placeholder="Select Store"
//                         filter={false}
//                       />
//                     </div>
//                   </div>
//                   <div className="col-lg-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Responsible Person <span className="text-danger ms-1">*</span>
//                       </label>
//                       <CommonSelect
//                         className="w-100"
//                         options={personOptions}
//                         value={selectedPerson}
//                         onChange={(e) => setSelectedPerson(e.value)}
//                         placeholder="Select Person"
//                         filter={false}
//                       />
//                     </div>
//                   </div>
//                   <div className="col-lg-12">
//                     <div className="search-form mb-0">
//                       <label className="form-label">
//                         Product <span className="text-danger ms-1">*</span>
//                       </label>
//                       <div className="position-relative">
//                         <input type="text" className="form-control" placeholder="Select Product" />
//                         <i className="feather icon-search  feather-search" />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" className="btn btn-secondary me-2" data-bs-dismiss="modal">
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn btn-primary">
//                   Add Stock
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//       {/* /Add Stock */}
//       {/* Edit Stock */}
//       <div className="modal fade" id="edit-stock">
//         <div className="modal-dialog modal-dialog-centered stock-adjust-modal">
//           <div className="modal-content">
//             <div className="modal-header">
//               <div className="page-title">
//                 <h4>Edit Stock</h4>
//               </div>
//               <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
//                 <span aria-hidden="true">×</span>
//               </button>
//             </div>
//             <form>
//               <div className="modal-body">
//                 <div className="row">
//                   <div className="col-lg-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Warehouse <span className="text-danger ms-1">*</span>
//                       </label>
//                       <CommonSelect
//                         className="w-100"
//                         options={warehouseOptions}
//                         value={selectedWarehouse}
//                         onChange={(e) => setSelectedWarehouse(e.value)}
//                         placeholder="Select Warehouse"
//                         filter={false}
//                       />
//                     </div>
//                   </div>
//                   <div className="col-lg-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Store <span className="text-danger ms-1">*</span>
//                       </label>
//                       <CommonSelect
//                         className="w-100"
//                         options={storeOptions}
//                         value={selectedStore}
//                         onChange={(e) => setSelectedStore(e.value)}
//                         placeholder="Select Store"
//                         filter={false}
//                       />
//                     </div>
//                   </div>
//                   <div className="col-lg-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Responsible Person <span className="text-danger ms-1">*</span>
//                       </label>
//                       <CommonSelect
//                         className="w-100"
//                         options={personOptions}
//                         value={selectedPerson}
//                         onChange={(e) => setSelectedPerson(e.value)}
//                         placeholder="Select Person"
//                         filter={false}
//                       />
//                     </div>
//                   </div>
//                   <div className="col-lg-12">
//                     <div className="search-form mb-3">
//                       <label className="form-label">
//                         Product<span className="text-danger ms-1">*</span>
//                       </label>
//                       <div className="position-relative">
//                         <input type="text" className="form-control" placeholder="Select Product" defaultValue="Nike Jordan" />
//                         <i className="feather icon-search  feather-search" />
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-lg-12">
//                     <div className="modal-body-table">
//                       <div className="table-responsive">
//                         <table className="table  datanew">
//                           <thead>
//                             <tr>
//                               <th>Product</th>
//                               <th>SKU</th>
//                               <th>Category</th>
//                               <th>Qty</th>
//                               <th className="no-sort" />
//                             </tr>
//                           </thead>
//                           <tbody>
//                             <tr>
//                               <td>
//                                 <div className="d-flex align-items-center">
//                                   <Link to="#" className="avatar avatar-md me-2">
//                                     <img src={stockImg02} alt="product" />
//                                   </Link>
//                                   <Link to="#">Nike Jordan</Link>
//                                 </div>
//                               </td>
//                               <td>PT002</td>
//                               <td>Nike</td>
//                               <td>
//                                 <div className="product-quantity bg-gray-transparent border-0">
//                                   <span className="quantity-btn">
//                                     <i className="feather icon-minus-circle feather-search" />
//                                   </span>
//                                   <input type="text" className="quntity-input bg-transparent" defaultValue={2} />
//                                   <span className="quantity-btn">
//                                     +
//                                     <i className="feather icon-plus-circle plus-circle" />
//                                   </span>
//                                 </div>
//                               </td>
//                               <td>
//                                 <div className="d-flex align-items-center justify-content-between edit-delete-action">
//                                   <Link className="d-flex align-items-center border rounded p-2" to="#">
//                                     <i className="feather icon-trash-2" />
//                                   </Link>
//                                 </div>
//                               </td>
//                             </tr>
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" className="btn btn-secondary me-2" data-bs-dismiss="modal">
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn btn-primary">
//                   Save Changes
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//       {/* /Edit Stock */}
//       <DeleteModal />
//     </>
//   );
// };

// export default ManageStock;
