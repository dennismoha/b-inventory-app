import { useMemo, useState } from 'react';
import {
  MaterialReactTable,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
  type MRT_ColumnDef // If using TypeScript (optional, but recommended)
} from 'material-react-table';
import { useCreateUnitMutation, useGetUnitsQuery, useUpdateUnitMutation, useDeleteUnitMutation } from '@core/redux/api/inventory-api'; // Assuming you have these API hooks set up
// import { Unit } from '../interface/features-interface'; // The Unit interface

import { Box, Button, IconButton, Tooltip } from '@mui/material';
// import { EditIcon, DeleteIcon } from 'lucide-react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Unit } from '../interface/features-interface';
import CommonFooter from '@components/footer/commonFooter';
// import TableTopHead from '../../components/table-top-head';

export const Units = () => {
  // Fetch units from the API via Redux
  const { data: response, isLoading, isError } = useGetUnitsQuery('');

  const units: Unit[] = response ? response.data : [];
  const [createUnit, { isError: isCreateUnitError, error: createUnitError }] = useCreateUnitMutation();
  const [updateUnit] = useUpdateUnitMutation();
  const [deleteUnit] = useDeleteUnitMutation();

  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // Column definitions for Material React Table
  const columns = useMemo<MRT_ColumnDef<Unit>[]>(
    () => [
      {
        accessorKey: 'unit_id', // Unique unit identifier
        header: 'Unit ID',
        enableEditing: false,
        size: 30,
        enableHiding: true,
        enablePinning: true,
        visibleInShowHideMenu: false
      },
      {
        accessorKey: 'unit',
        header: 'Unit',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.unit,
          helperText: validationErrors?.unit,
          onFocus: () => setValidationErrors({ ...validationErrors, unit: undefined })
        }
      },
      {
        accessorKey: 'short_name',
        header: 'Short Name',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.short_name,
          helperText: validationErrors?.short_name,
          onFocus: () => setValidationErrors({ ...validationErrors, short_name: undefined })
        }
      },
      {
        accessorKey: 'no_of_products',
        header: 'No of Products',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.no_of_products,
          helperText: validationErrors?.no_of_products,
          onFocus: () => setValidationErrors({ ...validationErrors, no_of_products: undefined })
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

  // Validation function for the Unit
  const validateUnit = (unit: Unit) => {
    return {
      unit: !unit.unit ? 'Unit is required' : '',
      short_name: !unit.short_name ? 'Short Name is required' : '',
      no_of_products: !unit.no_of_products ? 'No of Products is required' : ''
    };
  };

  // Handle row creation

  const handleCreateUnit: MRT_TableOptions<Unit>['onCreatingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateUnit(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    values = { ...values };
    delete values.unit_id; // Ensure no unit_id is sent during creation
    delete values.created_at;
    delete values.updated_at;
    const no_of_products = Number(values.no_of_products);
    values = { ...values, no_of_products };
    await createUnit(values);
    if (!isCreateUnitError) {
      table.setCreatingRow(null); // Exit creating mode
    }
  };

  // Handle row update

  const handleUpdateUnit: MRT_TableOptions<Unit>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateUnit(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    values = { ...values };
    delete values.created_at;
    delete values.updated_at;
    await updateUnit(values);
    table.setEditingRow(null); // Exit editing mode
  };

  // Handle delete

  const openDeleteConfirmModal = (row: MRT_Row<Unit>) => {
    if (window.confirm(`Are you sure you want to delete this unit? ${JSON.stringify({ unit_id: row.id })}`)) {
      deleteUnit({ unit_id: row.id });
    }
  };

  // Pass table options to useMaterialReactTable
  const table = useMaterialReactTable({
    columns,
    data: units || [], // Ensure data is memoized or stable
    displayColumnDefOptions: {
      'mrt-row-actions': {
        visibleInShowHideMenu: false // Hide the built-in row actions column from the show/hide menu
      }
    },
    createDisplayMode: 'row', // Use row mode for creating rows
    editDisplayMode: 'row', // Use row mode for editing rows
    enableEditing: true,
    getRowId: (row) => row.unit_id,
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUnit,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleUpdateUnit,
    muiToolbarAlertBannerProps: isCreateUnitError
      ? {
          color: 'error',
          children: JSON.stringify(createUnitError.message)
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
        Create Unit
      </Button>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }} className="edit-delete-action d-flex align-items-center">
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)} className="me-2 p-2 d-flex align-items-center ">
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)} className="me-2 p-2 d-flex align-items-center">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    state: {
      isLoading,
      showAlertBanner: isCreateUnitError
    }
  });

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError) {
    return <div className="text-center text-red-500 py-4">Failed to fetch units</div>;
  }

  // Rendering the MaterialReactTable component
  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-title">
            <h4 className="fw-bold">Units</h4>
            <h6>Manage your units</h6>

            {/* <TableTopHead /> */}
          </div>

          {!units || units.length === 0 ? <div>No units available</div> : null}
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
};

// import { useState } from 'react';
// import { useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';
// import CommonFooter from '../../components/footer/commonFooter';
// import PrimeDataTable from '../../components/data-table';
// import TableTopHead from '../../components/table-top-head';
// import DeleteModal from '../../components/delete-modal';
// import SearchFromApi from '../../components/data-table/search';
// // import {  useGetUnitsQuery} from '@core/redux/api/inventory-api'; // Assuming you have these API hooks set up
// import type { Unit } from '@core/interface/index';
// import { useGetUnitsQuery } from '@core/redux/api/inventory-api';

// export const Units = () => {
//   const dataSource = useSelector((state: any) => state.rootReducer.unit_data);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [totalRecords, _setTotalRecords] = useState<any>(5);
//   const [rows, setRows] = useState<number>(10);

//   const { data: response, isLoading, isError } = useGetUnitsQuery('');

//   const units: Unit[] = response ? response.data : [];

//   const [_searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

//   console.log('units are ', units);
//   const handleSearch = (value: any) => {
//     setSearchQuery(value);
//   };
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
//     {
//       field: 'unit',
//       header: 'Unit',
//       key: 'unit',
//       sortable: true
//     },
//     {
//       field: 'shortname',
//       header: 'Short Name',
//       key: 'shortname',
//       sortable: true
//     },
//     {
//       field: 'noofproducts',
//       header: 'No of Products',
//       key: 'noofproducts',
//       sortable: true
//     },
//     {
//       field: 'createdon',
//       header: 'Created Date',
//       key: 'createdon',
//       sortable: true
//     },
//     {
//       field: 'status',
//       header: 'Status',
//       key: 'status',
//       sortable: true,
//       body: (rowData: any) => <span className="badge table-badge bg-success fw-medium fs-10">{rowData.status}</span>
//     },
//     {
//       header: '',
//       field: 'actions',
//       key: 'actions',
//       sortable: false,
//       body: (_row: any) => (
//         <div className="edit-delete-action d-flex align-items-center">
//           <Link className="me-2 p-2 d-flex align-items-center border rounded" to="#" data-bs-toggle="modal" data-bs-target="#edit-units">
//             <i className="feather icon-edit"></i>
//           </Link>
//           <Link className="p-2 d-flex align-items-center border rounded" to="#" data-bs-toggle="modal" data-bs-target="#delete-modal">
//             <i className="feather icon-trash-2"></i>
//           </Link>
//         </div>
//       )
//     }
//   ];

//   return (
//     <>
//       <div className="page-wrapper">
//         <div className="content">
//           <div className="page-header">
//             <div className="add-item d-flex">
//     <div className="page-title">
//       <h4 className="fw-bold">Units</h4>
//       <h6>Manage your units</h6>
//     </div>
//   </div>
//   <TableTopHead />
//   <div className="page-btn">
//     <Link to="#" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-units">
//       <i className="ti ti-circle-plus me-1"></i> Add Unit
//     </Link>
//   </div>
// </div>
//           {/* /product list */}
//           <div className="card table-list-card">
//             <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
//               <SearchFromApi callback={handleSearch} rows={rows} setRows={setRows} />
//               <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
//                 <div className="dropdown me-2">
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
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Shoe
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Electronics
//                       </Link>
//                     </li>
//                   </ul>
//                 </div>
//                 <div className="dropdown">
//                   <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
//                     Sort By : Last 7 Days
//                   </Link>
//                   <ul className="dropdown-menu  dropdown-menu-end p-3">
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Recently Added
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Ascending
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Desending
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Last Month
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Last 7 Days
//                       </Link>
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//             <div className="card-body">
//               <div className="table-responsive">
//                 <PrimeDataTable
//                   column={columns}
//                   data={dataSource}
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

//       {/* Add Unit */}
//       <div className="modal fade" id="add-units">
//         <div className="modal-dialog modal-dialog-centered">
//           <div className="modal-content">
//             <div className="page-wrapper-new p-0">
//               <div className="content">
//                 <div className="modal-header">
//                   <div className="page-title">
//                     <h4>Add Unit</h4>
//                   </div>
//                   <button type="button" className="close bg-danger text-white fs-16" data-bs-dismiss="modal" aria-label="Close">
//                     <span aria-hidden="true">×</span>
//                   </button>
//                 </div>
//                 <div className="modal-body">
//                   <form>
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Unit<span className="text-danger ms-1">*</span>
//                       </label>
//                       <input type="text" className="form-control" />
//                     </div>
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Short Name<span className="text-danger ms-1">*</span>
//                       </label>
//                       <input type="text" className="form-control" />
//                     </div>
//                     <div className="mb-0">
//                       <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
//                         <span className="status-label">Status</span>
//                         <input type="checkbox" id="user2" className="check" defaultChecked />
//                         <label htmlFor="user2" className="checktoggle" />
//                       </div>
//                     </div>
//                   </form>
//                 </div>
//                 <div className="modal-footer">
//                   <button type="button" className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">
//                     Cancel
//                   </button>
//                   <Link to="#" className="btn btn-primary fs-13 fw-medium p-2 px-3" data-bs-dismiss="modal">
//                     Add Unit
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* /Add Unit */}
//       {/* Edit Unit */}
//       <div className="modal fade" id="edit-units">
//         <div className="modal-dialog modal-dialog-centered">
//           <div className="modal-content">
//             <div className="page-wrapper-new p-0">
//               <div className="content">
//                 <div className="modal-header">
//                   <div className="page-title">
//                     <h4>Edit Unit</h4>
//                   </div>
//                   <button type="button" className="close bg-danger text-white fs-16" data-bs-dismiss="modal" aria-label="Close">
//                     <span aria-hidden="true">×</span>
//                   </button>
//                 </div>
//                 <div className="modal-body">
//                   <form>
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Unit<span className="text-danger ms-1">*</span>
//                       </label>
//                       <input type="text" className="form-control" defaultValue="Kilograms" />
//                     </div>
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Short Name<span className="text-danger ms-1">*</span>
//                       </label>
//                       <input type="text" className="form-control" defaultValue="kg" />
//                     </div>
//                     <div className="mb-0">
//                       <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
//                         <span className="status-label">Status</span>
//                         <input type="checkbox" id="user3" className="check" defaultChecked />
//                         <label htmlFor="user3" className="checktoggle" />
//                       </div>
//                     </div>
//                   </form>
//                 </div>
//                 <div className="modal-footer">
//                   <button type="button" className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">
//                     Cancel
//                   </button>
//                   <Link to="#" className="btn btn-primary fs-13 fw-medium p-2 px-3" data-bs-dismiss="modal">
//                     Save Changes
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* /Edit Unit */}
//       <DeleteModal />
//     </>
//   );
// };
