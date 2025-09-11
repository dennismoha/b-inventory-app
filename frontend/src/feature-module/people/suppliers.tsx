import { useMemo, useState } from 'react';
import {
  MaterialReactTable,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
  type MRT_ColumnDef // If using TypeScript (optional, but recommended)
} from 'material-react-table';
import {
  useCreateSupplierMutation,
  useGetSuppliersQuery,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation
} from '@core/redux/api/inventory-api'; // Assuming you have these API hooks set up
import type { Supplier } from '../interface/features-interface'; // The Supplier interface
import CommonFooter from '@components/footer/commonFooter';

import { Box, Button, IconButton, Tooltip } from '@mui/material';
// import { EditIcon, DeleteIcon } from 'lucide-react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function SupplierList() {
  // Fetch suppliers from the API via Redux
  const { data: response, isLoading, isError } = useGetSuppliersQuery('');

  const suppliers: Supplier[] = response ? response.data : [];

  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // Column definitions for Material React Table
  const columns = useMemo<MRT_ColumnDef<Supplier>[]>(
    () => [
      {
        accessorKey: 'supplier_id', // Unique supplier identifier
        header: 'Supplier ID',
        enableEditing: false,
        size: 30,
        enableHiding: true,
        enablePinning: true,
        visibleInShowHideMenu: false
      },
      {
        accessorKey: 'name',
        header: 'Supplier Name',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.name,
          helperText: validationErrors?.name,
          onFocus: () => setValidationErrors({ ...validationErrors, name: undefined })
        }
      },
      {
        accessorKey: 'address',
        header: 'Address',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.address,
          helperText: validationErrors?.address,
          onFocus: () => setValidationErrors({ ...validationErrors, address: undefined })
        }
      },
      {
        accessorKey: 'contact',
        header: 'Contact Information',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.contact,
          helperText: validationErrors?.contact,
          onFocus: () => setValidationErrors({ ...validationErrors, contact: undefined })
        }
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        enableEditing: false,
        size: 180
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated At',
        enableEditing: false,
        size: 180
      }
    ],
    [validationErrors]
  );

  // Validation function for the Supplier
  const validateSupplier = (supplier: Supplier) => {
    return {
      name: !supplier.name ? 'Supplier Name is required' : '',
      address: !supplier.address ? 'Address is required' : '',
      contact: !supplier.contact ? 'Contact Information is required' : ''
    };
  };

  // Handle row creation
  const [createSupplier, { error: createSupplierError, isError: isCreateSupplierError }] = useCreateSupplierMutation();
  const handleCreateSupplier: MRT_TableOptions<Supplier>['onCreatingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateSupplier(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    values = { ...values };
    delete values.supplier_id; // Ensure no supplier_id is sent during creation
    delete values.updated_at;
    delete values.created_at;
    await createSupplier(values);
    table.setCreatingRow(null); // Exit creating mode
  };

  // Handle row update
  const [updateSupplier] = useUpdateSupplierMutation();
  const handleUpdateSupplier: MRT_TableOptions<Supplier>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateSupplier(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    values = { ...values };

    delete values.updated_at;
    delete values.created_at;
    await updateSupplier(values);
    table.setEditingRow(null); // Exit editing mode
  };

  // Handle delete
  const [deleteSupplier] = useDeleteSupplierMutation();
  const openDeleteConfirmModal = (row: MRT_Row<Supplier>) => {
    if (window.confirm(`Are you sure you want to delete this supplier? ${JSON.stringify({ supplier_id: row.id })}`)) {
      deleteSupplier({ supplier_id: row.id });
    }
  };

  // Pass table options to useMaterialReactTable
  const table = useMaterialReactTable({
    columns,
    data: suppliers || [], // Ensure data is memoized or stable
    displayColumnDefOptions: {
      'mrt-row-actions': {
        visibleInShowHideMenu: false // Hide the built-in row actions column from the show/hide menu
      }
    },
    createDisplayMode: 'row', // Use row mode for creating rows
    editDisplayMode: 'row', // Use row mode for editing rows
    enableEditing: true,
    getRowId: (row) => row.supplier_id,
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateSupplier,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleUpdateSupplier,

    muiToolbarAlertBannerProps: isCreateSupplierError
      ? {
          color: 'error',
          children: JSON.stringify(createSupplierError.message)
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
          table.setCreatingRow(true); // Open create row modal
        }}
      >
        Create Supplier
      </Button>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    state: {
      isLoading,
      showAlertBanner: isCreateSupplierError
    }
  });

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError) {
    return <div className="text-center text-red-500 py-4">Failed to fetch suppliers</div>;
  }

  // Rendering the MaterialReactTable component
  return (
    <>
      {!suppliers || suppliers.length === 0 ? <div>No suppliers available</div> : null}
      {/* <MaterialReactTable table={table} />; */}
      <div className="page-wrapper">
        <div className="content">
          <div className="page-title">
            <h4 className="fw-bold">Suppliers</h4>
            <h6>Manage your Suppliers</h6>

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
    </>
  );
}

// import { suppliersData } from '../../core/json/suppliers-data';
// import PrimeDataTable from '../../components/data-table';
// import SearchFromApi from '../../components/data-table/search';
// import DeleteModal from '../../components/delete-modal';
// import CommonSelect from '../../components/select/common-select';
// import TableTopHead from '../../components/table-top-head';
// import CommonFooter from '../../components/footer/commonFooter';
// import { editSupplier } from '../../utils/imagepath';
// import { useState } from 'react';
// import { Link } from 'react-router';
// import { useGetSuppliersQuery } from '@core/redux/api/inventory-api';
// import type { Supplier } from '../interface/features-interface';

// const Suppliers = () => {
//   const [listData, _setListData] = useState<any[]>(suppliersData);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [totalRecords, _setTotalRecords] = useState<any>(5);
//   const [rows, setRows] = useState<number>(10);
//   const [_searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
//   const [selectedCity, setSelectedCity] = useState('');
//   const [selectedState, setSelectedState] = useState('');
//   const [selectedCountry, setSelectedCountry] = useState('');
//   const { data: response, isLoading, isError } = useGetSuppliersQuery('');

//   const suppliers: Supplier[] = response ? response.data : [];
//   console.log('suppliers are ', suppliers);
//   const cityOptions = [
//     { label: 'Select', value: '' },
//     { label: 'Los Angles', value: 'los-angles' },
//     { label: 'New York City', value: 'new-york-city' },
//     { label: 'Houston', value: 'houston' }
//   ];

//   const stateOptions = [
//     { label: 'Select', value: '' },
//     { label: 'California', value: 'california' },
//     { label: 'New York', value: 'new-york' },
//     { label: 'Texas', value: 'texas' }
//   ];

//   const countryOptions = [
//     { label: 'Select', value: '' },
//     { label: 'United States', value: 'united-states' },
//     { label: 'Canada', value: 'canada' },
//     { label: 'Germany', value: 'germany' }
//   ];

//   const columns = [
//     {
//       header: (
//         <label className="checkboxs">
//           <input type="checkbox" id="select-all" />
//           <span className="checkmarks" />
//         </label>
//       ),
//       body: () => (
//         <label className="checkboxs">
//           <input type="checkbox" />
//           <span className="checkmarks" />
//         </label>
//       ),
//       sortable: false,
//       key: 'checked'
//     },
//     { header: 'Code', field: 'code', key: 'code' },
//     {
//       header: 'Supplier',
//       field: 'supplier',
//       key: 'supplier',
//       body: (data: any) => (
//         <div className="d-flex align-items-center">
//           <Link to="#" className="avatar avatar-md">
//             <img src={data.avatar} className="img-fluid rounded-2" alt="img" />
//           </Link>
//           <div className="ms-2">
//             <p className="text-gray-9 mb-0">
//               <Link to="#">{data.supplier}</Link>
//             </p>
//           </div>
//         </div>
//       )
//     },
//     { header: 'Email', field: 'email', key: 'email' },
//     { header: 'Phone', field: 'phone', key: 'phone' },
//     { header: 'Country', field: 'country', key: 'country' },
//     {
//       header: 'Status',
//       field: 'status',
//       key: 'status',
//       body: (data: any) => (
//         <span className="badge badge-success d-inline-flex align-items-center badge-xs">
//           <i className="ti ti-point-filled me-1"></i>
//           {data.status}
//         </span>
//       )
//     },
//     {
//       header: '',
//       field: 'actions',
//       key: 'actions',
//       sortable: false,
//       body: (_row: any) => (
//         <div className="edit-delete-action">
//           <Link className="me-2 p-2" to="#">
//             <i className="feather icon-eye"></i>
//           </Link>
//           <Link className="me-2 p-2" to="#" data-bs-toggle="modal" data-bs-target="#edit-supplier">
//             <i className="feather icon-edit"></i>
//           </Link>
//           <Link className="p-2" to="#" data-bs-toggle="modal" data-bs-target="#delete-modal">
//             <i className="feather icon-trash-2"></i>
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
//                 <h4>Suppliers</h4>
//                 <h6>Manage your suppliers</h6>
//               </div>
//             </div>
//             <TableTopHead />
//             <div className="page-btn">
//               <Link to="#" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-supplier">
//                 <i className="ti ti-circle-plus me-1" />
//                 Add Supplier
//               </Link>
//             </div>
//           </div>
//           {/* /product list */}
//           <div className="card">
//             <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
//               <SearchFromApi callback={handleSearch} rows={rows} setRows={setRows} />
//               <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
//                 <div className="dropdown">
//                   <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
//                     Status
//                   </Link>
//                   <ul className="dropdown-menu  dropdown-menu-end p-3">
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Active
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Inactive
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
//       {/* Add Supplier */}
//       <div className="modal fade" id="add-supplier">
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
//             <form action="suppliers.html">
//               <div className="modal-body">
//                 <div className="row">
//                   <div className="col-lg-12">
//                     <div className="new-employee-field">
//                       <div className="profile-pic-upload mb-2">
//                         <div className="profile-pic">
//                           <span>
//                             <i className="feather icon-plus-circle plus-down-add" />
//                             Add Image
//                           </span>
//                         </div>
//                         <div className="mb-0">
//                           <div className="image-upload mb-2">
//                             <input type="file" />
//                             <div className="image-uploads">
//                               <h4>Upload Image</h4>
//                             </div>
//                           </div>
//                           <p>JPEG, PNG up to 2 MB</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-lg-6">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         First Name <span className="text-danger">*</span>
//                       </label>
//                       <input type="text" className="form-control" />
//                     </div>
//                   </div>
//                   <div className="col-lg-6">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Last Name <span className="text-danger">*</span>
//                       </label>
//                       <input type="text" className="form-control" />
//                     </div>
//                   </div>
//                   <div className="col-lg-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Email <span className="text-danger">*</span>
//                       </label>
//                       <input type="email" className="form-control" />
//                     </div>
//                   </div>
//                   <div className="col-lg-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Phone <span className="text-danger">*</span>
//                       </label>
//                       <input type="text" className="form-control" />
//                     </div>
//                   </div>
//                   <div className="col-lg-12">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Address <span className="text-danger">*</span>
//                       </label>
//                       <input type="text" className="form-control" />
//                     </div>
//                   </div>
//                   <div className="col-lg-6 col-sm-10 col-10">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         City <span className="text-danger">*</span>
//                       </label>
//                       <CommonSelect
//                         className="w-100"
//                         options={cityOptions}
//                         value={selectedCity}
//                         onChange={(e) => setSelectedCity(e.value)}
//                         placeholder="Select City"
//                         filter={false}
//                       />
//                     </div>
//                   </div>
//                   <div className="col-lg-6 col-sm-10 col-10">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         State <span className="text-danger">*</span>
//                       </label>
//                       <CommonSelect
//                         className="w-100"
//                         options={stateOptions}
//                         value={selectedState}
//                         onChange={(e) => setSelectedState(e.value)}
//                         placeholder="Select State"
//                         filter={false}
//                       />
//                     </div>
//                   </div>
//                   <div className="col-lg-6 col-sm-10 col-10">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Country <span className="text-danger">*</span>
//                       </label>
//                       <CommonSelect
//                         className="w-100"
//                         options={countryOptions}
//                         value={selectedCountry}
//                         onChange={(e) => setSelectedCountry(e.value)}
//                         placeholder="Select Country"
//                         filter={false}
//                       />
//                     </div>
//                   </div>
//                   <div className="col-lg-6">
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Postal Code <span className="text-danger">*</span>
//                       </label>
//                       <input type="text" className="form-control" />
//                     </div>
//                   </div>
//                   <div className="col-md-12">
//                     <div className="mb-0">
//                       <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
//                         <span className="status-label">Status</span>
//                         <input type="checkbox" id="users5" className="check" defaultChecked />
//                         <label htmlFor="users5" className="checktoggle mb-0" />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" className="btn me-2 btn-secondary" data-bs-dismiss="modal">
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn btn-primary">
//                   Add Supplier
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//       {/* /Add Supplier */}
//       {/* Edit Supplier */}
//       <div className="modal fade" id="edit-supplier">
//         <div className="modal-dialog modal-dialog-centered">
//           <div className="modal-content">
//             <div className="content">
//               <div className="modal-header">
//                 <div className="page-title">
//                   <h4>Edit Supplier</h4>
//                 </div>
//                 <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
//                   <span aria-hidden="true">×</span>
//                 </button>
//               </div>
//               <form action="suppliers.html">
//                 <div className="modal-body">
//                   <div className="row">
//                     <div className="col-lg-12">
//                       <div className="new-employee-field">
//                         <div className="profile-pic-upload edit-pic">
//                           <div className="profile-pic">
//                             <span>
//                               <img src={editSupplier} alt="Img" />
//                             </span>
//                             <div className="close-img">
//                               <i className="feather icon-x info-img" />
//                             </div>
//                           </div>
//                           <div className="mb-0">
//                             <div className="image-upload mb-0">
//                               <input type="file" />
//                               <div className="image-uploads">
//                                 <h4>Change Image</h4>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="col-lg-6">
//                       <div className="mb-3">
//                         <label className="form-label">
//                           First Name <span className="text-danger">*</span>
//                         </label>
//                         <input type="text" className="form-control" defaultValue="Apex" />
//                       </div>
//                     </div>
//                     <div className="col-lg-6">
//                       <div className="mb-3">
//                         <label className="form-label">
//                           Last Name <span className="text-danger">*</span>
//                         </label>
//                         <input type="text" className="form-control" defaultValue="Computers" />
//                       </div>
//                     </div>
//                     <div className="col-lg-12">
//                       <div className="mb-3">
//                         <label className="form-label">
//                           Email <span className="text-danger">*</span>
//                         </label>
//                         <input type="email" className="form-control" defaultValue="carlevans@example.com" />
//                       </div>
//                     </div>
//                     <div className="col-lg-12">
//                       <div className="mb-3">
//                         <label className="form-label">
//                           Phone <span className="text-danger">*</span>
//                         </label>
//                         <input type="text" className="form-control" defaultValue={+15964712634} />
//                       </div>
//                     </div>
//                     <div className="col-lg-12">
//                       <div className="mb-3">
//                         <label className="form-label">
//                           Address <span className="text-danger">*</span>
//                         </label>
//                         <input type="text" className="form-control" defaultValue="46 Perry Street" />
//                       </div>
//                     </div>
//                     <div className="col-lg-6 col-sm-10 col-10">
//                       <div className="mb-3">
//                         <label className="form-label">
//                           City <span className="text-danger">*</span>
//                         </label>
//                         <CommonSelect
//                           className="w-100"
//                           options={cityOptions}
//                           value={selectedCity}
//                           onChange={(e) => setSelectedCity(e.value)}
//                           placeholder="Select City"
//                           filter={false}
//                         />
//                       </div>
//                     </div>
//                     <div className="col-lg-6 col-sm-10 col-10">
//                       <div className="mb-3">
//                         <label className="form-label">
//                           State <span className="text-danger">*</span>
//                         </label>
//                         <CommonSelect
//                           className="w-100"
//                           options={stateOptions}
//                           value={selectedState}
//                           onChange={(e) => setSelectedState(e.value)}
//                           placeholder="Select State"
//                           filter={false}
//                         />
//                       </div>
//                     </div>
//                     <div className="col-lg-6 col-sm-10 col-10">
//                       <div className="mb-3">
//                         <label className="form-label">
//                           Country <span className="text-danger">*</span>
//                         </label>
//                         <CommonSelect
//                           className="w-100"
//                           options={countryOptions}
//                           value={selectedCountry}
//                           onChange={(e) => setSelectedCountry(e.value)}
//                           placeholder="Select Country"
//                           filter={false}
//                         />
//                       </div>
//                     </div>
//                     <div className="col-lg-6">
//                       <div className="mb-3">
//                         <label className="form-label">
//                           Postal Code <span className="text-danger">*</span>
//                         </label>
//                         <input type="text" className="form-control" defaultValue={10176} />
//                       </div>
//                     </div>
//                     <div className="col-md-12">
//                       <div className="mb-0">
//                         <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
//                           <span className="status-label">Status</span>
//                           <input type="checkbox" id="users6" className="check" defaultChecked />
//                           <label htmlFor="users6" className="checktoggle mb-0" />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="modal-footer">
//                   <button type="button" className="btn me-2 btn-secondary" data-bs-dismiss="modal">
//                     Cancel
//                   </button>
//                   <button type="submit" className="btn btn-primary">
//                     Save Changes
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* /Edit Supplier */}
//       <DeleteModal />
//     </>
//   );
// };

// export default Suppliers;
