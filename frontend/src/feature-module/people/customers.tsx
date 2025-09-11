import { useState, useMemo, useEffect } from 'react';
import { Box, Button, IconButton, Tooltip, MenuItem } from '@mui/material';
import {
  type LiteralUnion,
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_TableOptions,
  useMaterialReactTable
} from 'material-react-table';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation
} from '@core/redux/api/inventory-api';
import type { Customer } from '../interface/features-interface';
import { toast } from 'react-toastify';
import CommonFooter from '@components/footer/commonFooter';

const CustomersManagement = () => {
  // const { data: CustomersData, isLoading, isError: getCustomersError } = useGetCustomersQuery();

  // const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // const customersData = CustomersData?.data || [];

  // // Redux Mutation Hooks for Create, Update, Delete
  // const [createCustomer, { isError: cusomerError, error: customerErrorCreating }] = useCreateCustomerMutation();

  // const [updateCustomer] = useUpdateCustomerMutation();
  // const [deleteCustomer] = useDeleteCustomerMutation();
  const { data: CustomersData, isLoading, isError: getCustomersError, error: customersError } = useGetCustomersQuery();

  // State for form validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // Mutation hooks for create, update, and delete customer
  const [createCustomer, { isError: customerError, error: customerErrorCreating, isSuccess: customerCreated }] =
    useCreateCustomerMutation();
  const [updateCustomer, { isError: updatingCustomerError, error: updateCustomerError, isSuccess: customerUpdated }] =
    useUpdateCustomerMutation();
  const [deleteCustomer, { isError: deletingCustomerError, error: deleteCustomerError, isSuccess: customerDeleted }] =
    useDeleteCustomerMutation();
  const customersData = CustomersData?.data || [];

  useEffect(() => {
    toast.dismiss();
    // Handling Get Customers Query state
    if (isLoading) {
      toast.info('Fetching customers...');
    }

    if (getCustomersError && customersError) {
      if ('message' in customersError) {
        toast.error(`Error fetching customers: ${customersError.message || ''}`);
      }
    }

    // Handling Create Customer Mutation state
    if (customerError && customerErrorCreating) {
      if ('message' in customerErrorCreating) {
        toast.error(`Error creating customer: ${customerErrorCreating.message || ''}`);
      }
    }

    if (customerCreated) {
      toast.success('Customer created successfully!');
    }

    // Handling Update Customer Mutation state
    if (updatingCustomerError && updateCustomerError) {
      if ('message' in updateCustomerError) {
        toast.error(`Error updating customer: ${updateCustomerError.message || ''}`);
      }
    }

    if (customerUpdated) {
      toast.success('Customer updated successfully!');
    }

    // Handling Delete Customer Mutation state
    if (deletingCustomerError && deleteCustomerError) {
      if ('message' in deleteCustomerError) {
        toast.error(`Error deleting customer: ${deleteCustomerError.message || ''}`);
      }
    }

    if (customerDeleted) {
      toast.success('Customer deleted successfully!');
    }
  }, [
    isLoading,
    getCustomersError,
    customersError,
    customerError,
    customerErrorCreating,
    customerCreated,
    updatingCustomerError,
    updateCustomerError,
    customerUpdated,
    deletingCustomerError,
    deleteCustomerError,
    customerDeleted
  ]);

  const columns = useMemo<MRT_ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: 'customerId',
        header: 'Customer ID',
        size: 150,
        enableEditing: false,
        muiTableHeadCellProps: { style: { color: 'green' } }, // Custom props
        visibleInShowHideMenu: true
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        size: 150,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.firstName,
          helperText: validationErrors?.firstName,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              firstName: undefined
            })
        }
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        size: 150,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.lastName,
          helperText: validationErrors?.lastName,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              lastName: undefined
            })
        }
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 200,
        muiEditTextFieldProps: {
          required: true,
          type: 'email',
          error: !!validationErrors?.email,
          helperText: validationErrors?.email,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              email: undefined
            })
        }
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone Number',
        size: 150,
        muiEditTextFieldProps: {
          required: true,
          type: 'tel',
          error: !!validationErrors?.phoneNumber,
          helperText: validationErrors?.phoneNumber,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              phoneNumber: undefined
            })
        }
      },
      {
        accessorKey: 'address',
        header: 'Address',
        size: 250,
        enableEditing: true
      },
      {
        accessorKey: 'country',
        header: 'Country',
        size: 150,
        muiEditTextFieldProps: {
          error: !!validationErrors?.country,
          helperText: validationErrors?.country,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              country: undefined
            })
        }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
        muiEditTextFieldProps: {
          required: true,
          select: true,
          children: [
            <MenuItem key="active" value="active">
              Active
            </MenuItem>,
            <MenuItem key="inactive" value="inactive">
              Inactive
            </MenuItem>
          ],
          error: !!validationErrors?.status,
          helperText: validationErrors?.status,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              status: undefined
            })
        }
      },
      {
        accessorKey: 'loyaltyPoints',
        header: 'Loyalty Points',
        size: 150,
        enableEditing: true
      },

      {
        accessorKey: 'createdAt',
        header: 'Created At',
        size: 200,
        Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleDateString(),
        enableEditing: false
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated At',
        size: 200,
        Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleDateString(),
        enableEditing: false
      },

      {
        accessorKey: 'notes',
        header: 'Notes',
        size: 250,
        enableEditing: true
      },
      {
        accessorKey: 'preferredPaymentMethod',
        header: 'Preferred Payment Method',
        size: 200,
        enableEditing: true
      }
    ],
    [validationErrors]
  );

  // Handle creating a new customer
  const handleCreateCustomer: MRT_TableOptions<Customer>['onCreatingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateCustomer(values);

    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }

    setValidationErrors({});
    values = { ...values };
    delete values.customerId;
    delete values.createdAt;
    delete values.updatedAt;
    values.loyaltyPoints = Number(values.loyaltyPoints);
    await createCustomer(values);
    table.setCreatingRow(null);
  };

  // Handle updating an existing customer
  const handleSaveCustomer: MRT_TableOptions<Customer>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateCustomer(values);

    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }

    setValidationErrors({});
    values = { ...values };

    delete values.createdAt;
    delete values.updatedAt;

    await updateCustomer(values);
    table.setEditingRow(null);
  };

  // Handle deleting a customer
  const handleDelete = async (row: Customer) => {
    const confirmed = window.confirm('Are you sure you want to delete this customer?');
    if (confirmed) {
      await deleteCustomer({ customerId: row.customerId });
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: customersData || [],
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableEditing: true,
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateCustomer,
    onEditingRowCancel: () => setValidationErrors({}),
    muiToolbarAlertBannerProps:
      customerError || getCustomersError
        ? {
            color: 'error',
            children: customerError ? 'error creating customer' : 'error'
          }
        : undefined,
    onEditingRowSave: handleSaveCustomer,
    getRowId: (row) => row.customerId,
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => handleDelete(row.original)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true); // Open the create row form
        }}
      >
        Add New Customer
      </Button>
    ),
    state: {
      isLoading,
      showAlertBanner: customerError || getCustomersError
    }
  });

  // Validation function
  const validateCustomer = (
    values: Record<
      LiteralUnion<
        | 'status'
        | 'email'
        | 'customerId'
        | 'address'
        | 'notes'
        | 'firstName'
        | 'lastName'
        | 'phoneNumber'
        | 'country'
        | 'createdAt'
        | 'updatedAt'
        | 'loyaltyPoints'
        | 'totalSpent'
        | 'preferredPaymentMethod',
        string
      >,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    >
  ) => {
    const errors: Record<string, string | undefined> = {};

    if (!values.firstName) errors.firstName = 'First name is required';
    if (!values.lastName) errors.lastName = 'Last name is required';
    if (!values.email) errors.email = 'Email is required';
    if (!values.phoneNumber) errors.phoneNumber = 'Phone number is required';
    if (!values.status) errors.status = 'Status is required';

    return errors;
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-title">
          <h4 className="fw-bold">Customers</h4>
          <h6>Manage your customers</h6>

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
    // <Box sx={{ padding: 2 }}>
    //   {isLoading && <div>Loading customers...</div>}
    //   {/* {cusomerError? JSON.stringify(customerErrorCreating?.data.message): null} */}

    //   <MaterialReactTable table={table} />
    // </Box>
  );
};

export default CustomersManagement;

// import { customersData } from '../../core/json/customers-data';
// import PrimeDataTable from '../../components/data-table';
// import SearchFromApi from '../../components/data-table/search';
// import DeleteModal from '../../components/delete-modal';
// import CommonSelect from '../../components/select/common-select';
// import TableTopHead from '../../components/table-top-head';
// import { user41 } from '../../utils/imagepath';
// import { useState } from 'react';
// import { Link } from 'react-router';
// import { useGetCustomersQuery } from '@core/redux/api/inventory-api';

// const Customers = () => {
//   const [listData, _setListData] = useState<any[]>(customersData);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [totalRecords, _setTotalRecords] = useState<any>(5);
//   const [rows, setRows] = useState<number>(10);
//   const [_searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
//   const [selectedCity, setSelectedCity] = useState('');
//   const [selectedState, setSelectedState] = useState('');
//   const [selectedCountry, setSelectedCountry] = useState('');
//   const { data: CustomersData, isLoading, isError: getCustomersError, error: customersError } = useGetCustomersQuery();
//   console.log('customer data ', customersData);

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
//       header: 'Customer',
//       field: 'customer',
//       key: 'customer',
//       body: (data: any) => (
//         <div className="d-flex align-items-center">
//           <Link to="#" className="avatar avatar-md me-2">
//             <img src={data.avatar} alt="product" />
//           </Link>
//           <Link to="#">{data.customer}</Link>
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
//         <span
//           className={`d-inline-flex align-items-center p-1 pe-2 rounded-1 text-white bg-${data.status === 'Active' ? 'success' : 'danger'} fs-10`}
//         >
//           <i className="ti ti-point-filled me-1 fs-11"></i>
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
//         <div className="edit-delete-action d-flex align-items-center">
//           <Link className="me-2 p-2 d-flex align-items-center border rounded" to="#">
//             <i className="feather icon-eye"></i>
//           </Link>
//           <Link className="me-2 p-2 d-flex align-items-center border rounded" to="#" data-bs-toggle="modal" data-bs-target="#edit-customer">
//             <i className="feather icon-edit"></i>
//           </Link>
//           <Link className="p-2 d-flex align-items-center border rounded" to="#" data-bs-toggle="modal" data-bs-target="#delete-modal">
//             <i className="feather icon-trash-2"></i>
//           </Link>
//         </div>
//       )
//     }
//   ];

//   const handleSearch = (value: any) => {
//     setSearchQuery(value);
//   };

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

//   return (
//     <>
//       {' '}
//       <div className="page-wrapper">
//         <div className="content">
//           <div className="page-header">
//             <div className="add-item d-flex">
//               <div className="page-title">
//                 <h4 className="fw-bold">Customers</h4>
//                 <h6>Manage your customers</h6>
//               </div>
//             </div>
//             <TableTopHead />
//             <div className="page-btn">
//               <Link to="#" className="btn btn-primary text-white" data-bs-toggle="modal" data-bs-target="#add-customer">
//                 <i className="ti ti-circle-plus me-1" />
//                 Add Customer
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
//         <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
//           <p className="mb-0 text-gray-9">2014 - 2025 © DreamsPOS. All Right Reserved</p>
//           <p>
//             Designed &amp; Developed by{' '}
//             <Link to="#" className="text-primary">
//               Dreams
//             </Link>
//           </p>
//         </div>
//       </div>
//       {/* Add Customer */}
//       <div className="modal fade" id="add-customer">
//         <div className="modal-dialog modal-dialog-centered">
//           <div className="modal-content">
//             <div className="modal-header">
//               <div className="page-title">
//                 <h4>Add Customer</h4>
//               </div>
//               <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
//                 <span aria-hidden="true">×</span>
//               </button>
//             </div>
//             <form action="customers.html">
//               <div className="modal-body">
//                 <div className="new-employee-field">
//                   <div className="profile-pic-upload">
//                     <div className="profile-pic">
//                       <span>
//                         <i className="feather icon-plus-circle plus-down-add" /> Add Image
//                       </span>
//                     </div>
//                     <div className="mb-3">
//                       <div className="image-upload mb-0">
//                         <input type="file" />
//                         <div className="image-uploads">
//                           <h4>Upload Image</h4>
//                         </div>
//                       </div>
//                       <p className="mt-2">JPEG, PNG up to 2 MB</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="row">
//                   <div className="col-lg-6 mb-3">
//                     <label className="form-label">
//                       First Name<span className="text-danger ms-1">*</span>
//                     </label>
//                     <input type="text" className="form-control" />
//                   </div>
//                   <div className="col-lg-6 mb-3">
//                     <label className="form-label">
//                       Last Name<span className="text-danger ms-1">*</span>
//                     </label>
//                     <input type="text" className="form-control" />
//                   </div>
//                   <div className="col-lg-12 mb-3">
//                     <label className="form-label">
//                       Email<span className="text-danger ms-1">*</span>
//                     </label>
//                     <input type="email" className="form-control" />
//                   </div>
//                   <div className="col-lg-12 mb-3">
//                     <label className="form-label">
//                       Phone<span className="text-danger ms-1">*</span>
//                     </label>
//                     <input type="tel" className="form-control" />
//                   </div>
//                   <div className="col-lg-12 mb-3">
//                     <label className="form-label">
//                       Address<span className="text-danger ms-1">*</span>
//                     </label>
//                     <input type="text" className="form-control" />
//                   </div>
//                   <div className="col-lg-6 mb-3">
//                     <label className="form-label">
//                       City<span className="text-danger ms-1">*</span>
//                     </label>
//                     <CommonSelect
//                       className="w-100"
//                       options={cityOptions}
//                       value={selectedCity}
//                       onChange={(e) => setSelectedCity(e.value)}
//                       placeholder="Select City"
//                       filter={false}
//                     />
//                   </div>
//                   <div className="col-lg-6 mb-3">
//                     <label className="form-label">
//                       State<span className="text-danger ms-1">*</span>
//                     </label>
//                     <CommonSelect
//                       className="w-100"
//                       options={stateOptions}
//                       value={selectedState}
//                       onChange={(e) => setSelectedState(e.value)}
//                       placeholder="Select State"
//                       filter={false}
//                     />
//                   </div>
//                   <div className="col-lg-6 mb-3">
//                     <label className="form-label">
//                       Country<span className="text-danger ms-1">*</span>
//                     </label>
//                     <CommonSelect
//                       className="w-100"
//                       options={countryOptions}
//                       value={selectedCountry}
//                       onChange={(e) => setSelectedCountry(e.value)}
//                       placeholder="Select Country"
//                       filter={false}
//                     />
//                   </div>
//                   <div className="col-lg-6 mb-3">
//                     <label className="form-label">
//                       Postal Code<span className="text-danger ms-1">*</span>
//                     </label>
//                     <input type="text" className="form-control" />
//                   </div>
//                   <div className="col-lg-12">
//                     <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
//                       <span className="status-label">Status</span>
//                       <input type="checkbox" id="user1" className="check" defaultChecked />
//                       <label htmlFor="user1" className="checktoggle">
//                         {' '}
//                       </label>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn btn-primary fs-13 fw-medium p-2 px-3">
//                   Add Customer
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//       {/* /Add Customer */}
//       {/* Edit Customer */}
//       <div className="modal fade" id="edit-customer">
//         <div className="modal-dialog modal-dialog-centered">
//           <div className="modal-content">
//             <div className="page-wrapper-new p-0">
//               <div className="content">
//                 <div className="modal-header">
//                   <div className="page-title">
//                     <h4>Edit Customer</h4>
//                   </div>
//                   <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
//                     <span aria-hidden="true">×</span>
//                   </button>
//                 </div>
//                 <form action="customers.html">
//                   <div className="modal-body">
//                     <div className="new-employee-field">
//                       <div className="profile-pic-upload image-field">
//                         <div className="profile-pic p-2">
//                           <img src={user41} className="object-fit-cover h-100 rounded-1" alt="user" />
//                           <button type="button" className="close rounded-1">
//                             <span aria-hidden="true">×</span>
//                           </button>
//                         </div>
//                         <div className="mb-3">
//                           <div className="image-upload mb-0">
//                             <input type="file" />
//                             <div className="image-uploads">
//                               <h4>Change Image</h4>
//                             </div>
//                           </div>
//                           <p className="mt-2">JPEG, PNG up to 2 MB</p>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="row">
//                       <div className="col-lg-6 mb-3">
//                         <label className="form-label">
//                           First Name<span className="text-danger ms-1">*</span>
//                         </label>
//                         <input type="text" className="form-control" defaultValue="Carl" />
//                       </div>
//                       <div className="col-lg-6 mb-3">
//                         <label className="form-label">
//                           Last Name<span className="text-danger ms-1">*</span>
//                         </label>
//                         <input type="text" className="form-control" defaultValue="Evans" />
//                       </div>
//                       <div className="col-lg-12 mb-3">
//                         <label className="form-label">
//                           Email<span className="text-danger ms-1">*</span>
//                         </label>
//                         <input type="email" className="form-control" defaultValue="carlevans@example.com" />
//                       </div>
//                       <div className="col-lg-12 mb-3">
//                         <label className="form-label">
//                           Phone<span className="text-danger ms-1">*</span>
//                         </label>
//                         <input type="tel" className="form-control" defaultValue={+12163547758} />
//                       </div>
//                       <div className="col-lg-12 mb-3">
//                         <label className="form-label">
//                           Address<span className="text-danger ms-1">*</span>
//                         </label>
//                         <input type="text" className="form-control" defaultValue="87 Griffin Street" />
//                       </div>
//                       <div className="col-lg-6 mb-3">
//                         <label className="form-label">
//                           City<span className="text-danger ms-1">*</span>
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
//                       <div className="col-lg-6 mb-3">
//                         <label className="form-label">
//                           State<span className="text-danger ms-1">*</span>
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
//                       <div className="col-lg-6 mb-3">
//                         <label className="form-label">
//                           Country<span className="text-danger ms-1">*</span>
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
//                       <div className="col-lg-6 mb-3">
//                         <label className="form-label">
//                           Postal Code<span className="text-danger ms-1">*</span>
//                         </label>
//                         <input type="text" className="form-control" defaultValue={90001} />
//                       </div>
//                       <div className="col-lg-12">
//                         <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
//                           <span className="status-label">Status</span>
//                           <input type="checkbox" id="user2" className="check" defaultChecked />
//                           <label htmlFor="user2" className="checktoggle">
//                             {' '}
//                           </label>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="modal-footer">
//                     <button type="button" className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">
//                       Cancel
//                     </button>
//                     <button type="submit" className="btn btn-primary fs-13 fw-medium p-2 px-3">
//                       Save Changes
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* /Edit Customer */}
//       <DeleteModal />
//     </>
//   );
// };

// export default Customers;
