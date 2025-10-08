'use client';
import { useEffect, useMemo, useState } from 'react';
import { MaterialReactTable, type MRT_Row, type MRT_TableOptions, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import {
  useCreateSubCategoryMutation,
  useGetSubCategoriesQuery,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation
} from '@core/redux/api/inventory-api'; // Assuming you have these hooks set up
import type { SubCategory } from '../interface/features-interface'; // Your interface for SubCategory
// Your interface for SubCategory
// import { useAppSelector } from '@/app/redux/redux';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
// import { EditIcon, DeleteIcon } from 'lucide-react';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import CommonFooter from '@components/footer/commonFooter';

export default function SubCategoryList() {
  const { data: response, isLoading: isLoadingQuery, isError: isErrorQuery, error: queryError } = useGetSubCategoriesQuery();
  const [createSubCategory, { isLoading: isLoadingCreate, isSuccess: isSuccessCreate, isError: isErrorCreate, error: errorCreate }] =
    useCreateSubCategoryMutation();
  const [updateSubCategory, { isLoading: isLoadingUpdate, isSuccess: isSuccessUpdate, isError: isErrorUpdate, error: errorUpdate }] =
    useUpdateSubCategoryMutation();
  const [deleteSubCategory, { isLoading: isLoadingDelete, isSuccess: isSuccessDelete, isError: isErrorDelete, error: errorDelete }] =
    useDeleteSubCategoryMutation();

  // Toast for the query (getting subcategories)
  useEffect(() => {
    toast.dismiss();

    if (isLoadingQuery) {
      toast.info('Loading subcategories...');
    }

    if (isErrorQuery) {
      console.log(`Error fetching subcategories: ${JSON.stringify(queryError) || 'Something went wrong'}`);
      toast.error(`Error fetching subcategories: ${JSON.stringify(queryError) || 'Something went wrong'}`);
    }

    if (response) {
      toast.success('Subcategories loaded successfully!');
    }

    // Toast for the create mutation (creating subcategory)
    if (isLoadingCreate) {
      toast.info('Creating subcategory...');
    }

    if (isSuccessCreate) {
      toast.success('Subcategory created successfully!');
    }

    if (isErrorCreate) {
      toast.error(`Error creating subcategory: ${JSON.stringify(errorCreate)} Something went wrong`);
    }

    // Toast for the update mutation (updating subcategory)
    if (isLoadingUpdate) {
      toast.info('Updating subcategory...');
    }

    if (isSuccessUpdate) {
      toast.success('Subcategory updated successfully!');
    }

    if (isErrorUpdate) {
      toast.error(`Error updating subcategory: ${JSON.stringify(errorUpdate)} Something went wrong`);
    }

    // Toast for the delete mutation (deleting subcategory)
    if (isLoadingDelete) {
      toast.info('Deleting subcategory...');
    }

    if (isSuccessDelete) {
      toast.success('Subcategory deleted successfully!');
    }

    if (isErrorDelete) {
      toast.error(`Error deleting subcategory: ${JSON.stringify(errorDelete)}`);
    }
  }, [
    isLoadingQuery,
    isErrorQuery,
    response,
    queryError,
    isLoadingCreate,
    isSuccessCreate,
    isErrorCreate,
    errorCreate,
    isLoadingUpdate,
    isSuccessUpdate,
    isErrorUpdate,
    errorUpdate,
    isLoadingDelete,
    isSuccessDelete,
    isErrorDelete,
    errorDelete
  ]);

  console.log('response is ', response);

  //const categories = useAppSelector((state) => state.categories.categories); // Assuming this is where categories are fetched

  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // Column definitions for the subcategory table
  const columns = useMemo<MRT_ColumnDef<SubCategory>[]>(
    () => [
      {
        accessorKey: 'subcategory_id',
        header: 'Subcategory ID',
        enableEditing: false,
        size: 30,
        enableHiding: true,
        enablePinning: true,
        visibleInShowHideMenu: true
      },
      {
        accessorKey: 'subcategory_name',
        header: 'Subcategory Name',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.subcategory_name,
          helperText: validationErrors?.subcategory_name,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              subcategory_name: undefined
            })
        }
      },
      {
        accessorKey: 'description',
        header: 'Description',
        enableHiding: false
      }
    ],
    [validationErrors] // Recalculate the columns when categories change
  );

  const subcategories: SubCategory[] = response ? response.data : [];

  // CREATE action for SubCategory
  const handleCreateSubCategory: MRT_TableOptions<SubCategory>['onCreatingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateSubCategory(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    values = { ...values };
    delete values.subcategory_id;

    await createSubCategory(values);
    table.setCreatingRow(null);
  };

  // Handle updating a category (
  const handleUpdateCategory: MRT_TableOptions<SubCategory>['onEditingRowSave'] = async ({ values, table }) => {
    // Validation logic
    const newValidationErrors = validateSubCategory(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    updateSubCategory(values);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    table.setEditingRow(null);
  };
  // DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<SubCategory>) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      deleteSubCategory(row.original.subcategory_id);
    }
  };

  // Table setup using useMaterialReactTable
  const table = useMaterialReactTable({
    columns,
    data: subcategories || [],
    enableRowSelection: false,
    enableBottomToolbar: true,
    enableClickToCopy: true,
    enableColumnActions: true,
    enableColumnDragging: true,
    enableColumnPinning: true,
    enablePagination: true,
    enableRowActions: true,
    enableRowDragging: false,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableEditing: true,
    getRowId: (row) => row.subcategory_id,
    muiToolbarAlertBannerProps: isErrorCreate
      ? {
          color: 'error',
          children: JSON.stringify(errorCreate.message)
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

    muiTableContainerProps: {
      sx: {
        minHeight: '500px'
      }
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateSubCategory,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleUpdateCategory,
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true); // Open the create row modal
        }}
      >
        Create Subcategory
      </Button>
    ),
    // renderRowActions: ({ row, table }) => (
    //   <Box sx={{ display: 'flex', gap: '1rem' }}>
    //     <Tooltip title="Edit">
    //       <IconButton onClick={() => table.setEditingRow(row)}>
    //         <EditIcon />
    //       </IconButton>
    //     </Tooltip>
    //     <Tooltip title="Delete">
    //       <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
    //         <DeleteIcon />
    //       </IconButton>
    //     </Tooltip>
    //   </Box>
    // ),
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
      showAlertBanner: isErrorCreate
    }
  });

  return (
    <>
      {!subcategories || subcategories.length === 0 ? <div>No subcategories available</div> : null}
      {/* <MaterialReactTable table={table} />; */}

      <div className="page-wrapper">
        <div className="content">
          <div className="page-title">
            <h4 className="fw-bold">subcategory</h4>
            <h6>Manage your subcategories</h6>

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

// Validation function for required fields
const validateRequired = (value: string) => !!value.length;

function validateSubCategory(subcategory: SubCategory) {
  return {
    subcategory_name: !validateRequired(subcategory.subcategory_name) ? 'Subcategory Name is required' : ''
  };
}

// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import CommonFooter from '../../components/footer/commonFooter';
// import {
//   laptop,
//   product1,
//   product10,
//   product11,
//   product12,
//   product13,
//   product14,
//   product15,
//   product16,
//   product17,
//   product2,
//   product3,
//   product4,
//   product5,
//   product6,
//   product7,
//   product8,
//   product9
// } from '../../utils/imagepath';
// import PrimeDataTable from '../../components/data-table';
// import TableTopHead from '../../components/table-top-head';
// import CommonSelect from '../../components/select/common-select';
// import DeleteModal from '../../components/delete-modal';
// import SearchFromApi from '../../components/data-table/search';
// import { Editor } from 'primereact/editor';
// import { useGetSubCategoriesQuery } from '@core/redux/api/inventory-api';

// export const subcateorydata = [
//   {
//     id: 1,
//     img: product1,
//     category: 'Computers',
//     parentcategory: 'Computers',
//     categorycode: 'CT001',
//     description: 'Computers description',
//     status: 'Active'
//   },
//   {
//     id: 2,
//     img: product2,
//     category: 'Fruits',
//     parentcategory: 'Fruits',
//     categorycode: 'CT002',
//     description: 'Fruits description',
//     status: 'Active'
//   },
//   {
//     id: 3,
//     img: product3,
//     category: 'Fruits',
//     parentcategory: 'Fruits',
//     categorycode: 'CT003',
//     description: 'Fruits description',
//     status: 'Active'
//   },
//   {
//     id: 4,
//     img: product4,
//     category: 'Fruits',
//     parentcategory: 'Fruits',
//     categorycode: 'CT004',
//     description: 'Fruits description',
//     status: 'Active'
//   },
//   {
//     id: 5,
//     img: product5,
//     category: 'Accessories',
//     parentcategory: 'Accessories',
//     categorycode: 'CT005',
//     description: 'Accessories description',
//     status: 'Active'
//   },
//   {
//     id: 6,
//     img: product6,
//     category: 'Shoes',
//     parentcategory: 'Shoes',
//     categorycode: 'CT006',
//     description: 'Shoes description',
//     status: 'Active'
//   },
//   {
//     id: 7,
//     img: product7,
//     category: 'Fruits',
//     parentcategory: 'Fruits',
//     categorycode: 'CT007',
//     description: 'Fruits description',
//     status: 'Active'
//   },
//   {
//     id: 8,
//     img: product8,
//     category: 'Fruits',
//     parentcategory: 'Fruits',
//     categorycode: 'CT008',
//     description: 'Fruits description',
//     status: 'Active'
//   },
//   {
//     id: 9,
//     img: product9,
//     category: 'Computers',
//     parentcategory: 'Computers',
//     categorycode: 'CT009',
//     description: 'Computers description',
//     status: 'Active'
//   },
//   {
//     id: 10,
//     img: product10,
//     category: 'Health Care',
//     parentcategory: 'Health Care',
//     categorycode: 'CT0010',
//     description: 'Health Care description',
//     status: 'Active'
//   },
//   {
//     id: 11,
//     img: product11,
//     category: 'Fruits',
//     parentcategory: 'Fruits',
//     categorycode: 'CT004',
//     description: 'Fruits description',
//     status: 'Active'
//   },
//   {
//     id: 12,
//     img: product12,
//     category: 'Accessories',
//     parentcategory: 'Accessories',
//     categorycode: 'CT005',
//     description: 'Accessories description',
//     status: 'Active'
//   },
//   {
//     id: 13,
//     img: product13,
//     category: 'Shoes',
//     parentcategory: 'Shoes',
//     categorycode: 'CT006',
//     description: 'Shoes description',
//     status: 'Active'
//   },
//   {
//     id: 14,
//     img: product14,
//     category: 'Fruits',
//     parentcategory: 'Fruits',
//     categorycode: 'CT007',
//     description: 'Fruits description',
//     status: 'Active'
//   },
//   {
//     id: 15,
//     img: product15,
//     category: 'Fruits',
//     parentcategory: 'Fruits',
//     categorycode: 'CT008',
//     description: 'Fruits description',
//     status: 'Active'
//   },
//   {
//     id: 16,
//     img: product16,
//     category: 'Computers',
//     parentcategory: 'Computers',
//     categorycode: 'CT009',
//     description: 'Computers description',
//     status: 'Active'
//   },
//   {
//     id: 17,
//     img: product17,
//     category: 'Health Care',
//     parentcategory: 'Health Care',
//     categorycode: 'CT0010',
//     description: 'Health Care description',
//     status: 'Active'
//   }
// ];

// // Interface for subcategory data structure
// interface SubCategoryData {
//   img: string;
//   parentcategory: string;
//   category: string;
//   categorycode: string;
//   description: string;
//   status: string;
//   createdby: string;
//   logo: string;
// }

// const SubCategories: React.FC = () => {
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [totalRecords, _setTotalRecords] = useState<any>(5);
//   const [rows, setRows] = useState<number>(10);
//   const [_searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
//   const { data: response, isLoading: isLoadingQuery, isError: isErrorQuery, error: queryError } = useGetSubCategoriesQuery();

//   const handleSearch = (value: any) => {
//     setSearchQuery(value);
//   };
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const Category = [{ label: 'Laptop', value: '1' }];
//   const [text, setText] = useState('');

//   console.log('subcategory data is ', response)

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
//       field: 'logo',
//       header: 'Image',
//       key: 'logo',
//       sortable: true,
//       body: (rowData: SubCategoryData) => (
//         <span className="productimgname">
//           <Link to="#" className="product-img stock-img">
//             <img alt="" src={rowData.img} />
//           </Link>
//         </span>
//       )
//     },
//     {
//       field: 'parentcategory',
//       header: 'Sub Category',
//       key: 'parentcategory',
//       sortable: true
//     },
//     {
//       field: 'category',
//       header: 'Category',
//       key: 'category',
//       sortable: true
//     },
//     {
//       field: 'categorycode',
//       header: 'Category Code',
//       key: 'categorycode',
//       sortable: true
//     },
//     {
//       field: 'description',
//       header: 'Description',
//       key: 'description',
//       sortable: true
//     },
//     {
//       field: 'status',
//       header: 'Status',
//       key: 'status',
//       sortable: true,
//       body: (rowData: SubCategoryData) => <span className="badge bg-success fw-medium fs-10">{rowData.status}</span>
//     },
//     {
//       header: '',
//       field: 'actions',
//       key: 'actions',
//       sortable: false,
//       body: (_row: any) => (
//         <div className="edit-delete-action d-flex align-items-center">
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

//   return (
//     <>
//       <div className="page-wrapper">
//         <div className="content">
//           <div className="page-header">
//             <div className="add-item d-flex">
//               <div className="page-title">
//                 <h4 className="fw-bold">Sub Category</h4>
//                 <h6>Manage your sub categories</h6>
//               </div>
//             </div>
//             <TableTopHead />
//             <div className="page-btn">
//               <Link to="#" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-category">
//                 <i className="ti ti-circle-plus me-1"></i> Add Sub Category
//               </Link>
//             </div>
//           </div>
//           {/* /product list */}
//           <div className="card table-list-card">
//             <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
//               <SearchFromApi callback={handleSearch} rows={rows} setRows={setRows} />
//               <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
//                 <div className="dropdown me-2">
//                   <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
//                     Category
//                   </Link>
//                   <ul className="dropdown-menu  dropdown-menu-end p-3">
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Computers
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Electronics
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
//                   </ul>
//                 </div>
//               </div>
//             </div>
//             <div className="card-body">
//               <div className="table-responsive sub-category-table">
//                 <PrimeDataTable
//                   column={columns}
//                   data={subcateorydata}
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
//       <>
//         {/* Add Category */}
//         <div className="modal fade" id="add-category">
//           <div className="modal-dialog modal-dialog-centered">
//             <div className="modal-content">
//               <div className="page-wrapper-new p-0">
//                 <div className="content">
//                   <div className="modal-header">
//                     <div className="page-title">
//                       <h4>Add Sub Category</h4>
//                     </div>
//                     <button type="button" className="close bg-danger text-white fs-16" data-bs-dismiss="modal" aria-label="Close">
//                       <span aria-hidden="true">×</span>
//                     </button>
//                   </div>
//                   <div className="modal-body">
//                     <form>
//                       <div className="mb-3">
//                         <div className="add-image-upload">
//                           <div className="add-image">
//                             <span className="fw-normal">
//                               <i className="feather icon-plus-circle plus-down-add" /> Add Image
//                             </span>
//                           </div>
//                           <div className="new-employee-field">
//                             <div className="mb-0">
//                               <div className="image-upload mb-2">
//                                 <input type="file" />
//                                 <div className="image-uploads">
//                                   <h4 className="fs-13 fw-medium">Upload Image</h4>
//                                 </div>
//                               </div>
//                               <span>JPEG, PNG up to 2 MB</span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="mb-3">
//                         <label className="form-label">
//                           Category<span className="text-danger ms-1">*</span>
//                         </label>
//                         <CommonSelect
//                           className="w-100"
//                           options={Category}
//                           value={selectedCategory}
//                           onChange={(e) => setSelectedCategory(e.value)}
//                           placeholder="Choose"
//                           filter={false}
//                         />
//                       </div>
//                       <div className="mb-3">
//                         <label className="form-label">
//                           Sub Category
//                           <span className="text-danger ms-1">*</span>
//                         </label>
//                         <input type="text" className="form-control" />
//                       </div>
//                       <div className="mb-3">
//                         <label className="form-label">
//                           Category Code
//                           <span className="text-danger ms-1">*</span>
//                         </label>
//                         <input type="text" className="form-control" />
//                       </div>
//                       <div className="mb-3">
//                         <label className="form-label">
//                           Description<span className="text-danger ms-1">*</span>
//                         </label>
//                         <Editor value={text} onTextChange={(e: any) => setText(e.htmlValue)} style={{ height: '200px' }} />
//                       </div>
//                       <div className="mb-0">
//                         <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
//                           <span className="status-label">Status</span>
//                           <input type="checkbox" id="user2" className="check" defaultChecked />
//                           <label htmlFor="user2" className="checktoggle" />
//                         </div>
//                       </div>
//                     </form>
//                   </div>
//                   <div className="modal-footer">
//                     <button type="button" className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">
//                       Cancel
//                     </button>
//                     <Link to="#" className="btn btn-primary fs-13 fw-medium p-2 px-3">
//                       Create Subcategory
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         {/* /Add Category */}
//         {/* Edit Category */}
//         <div className="modal fade" id="edit-category">
//           <div className="modal-dialog modal-dialog-centered">
//             <div className="modal-content">
//               <div className="page-wrapper-new p-0">
//                 <div className="content">
//                   <div className="modal-header">
//                     <div className="page-title">
//                       <h4>Edit Sub Category</h4>
//                     </div>
//                     <button type="button" className="close bg-danger text-white fs-16" data-bs-dismiss="modal" aria-label="Close">
//                       <span aria-hidden="true">×</span>
//                     </button>
//                   </div>
//                   <div className="modal-body">
//                     <form>
//                       <div className="mb-3">
//                         <div className="add-image-upload">
//                           <div className="add-image p-1 border-solid">
//                             <img src={laptop} alt="image" />
//                             <Link to="#">
//                               <i className="feather icon-x x-square-add image-close remove-product fs-12 text-white bg-danger rounded-1" />
//                             </Link>
//                           </div>
//                           <div className="new-employee-field">
//                             <div className="mb-0">
//                               <div className="image-upload mb-2">
//                                 <input type="file" />
//                                 <div className="image-uploads">
//                                   <h4 className="fs-13 fw-medium">Change Image</h4>
//                                 </div>
//                               </div>
//                               <span>JPEG, PNG up to 2 MB</span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="mb-3">
//                         <label className="form-label">
//                           Category<span className="text-danger ms-1">*</span>
//                         </label>
//                         <CommonSelect
//                           className="w-100"
//                           options={Category}
//                           value={selectedCategory}
//                           onChange={(e) => setSelectedCategory(e.value)}
//                           placeholder="Choose"
//                           filter={false}
//                         />
//                       </div>
//                       <div className="mb-3">
//                         <label className="form-label">
//                           Sub Category
//                           <span className="text-danger ms-1">*</span>
//                         </label>
//                         <input type="text" className="form-control" defaultValue="Laptop" />
//                       </div>
//                       <div className="mb-3">
//                         <label className="form-label">
//                           Category Code
//                           <span className="text-danger ms-1">*</span>
//                         </label>
//                         <input type="text" className="form-control" defaultValue="CT001" />
//                       </div>
//                       <div className="mb-3">
//                         <label className="form-label">
//                           Description<span className="text-danger ms-1">*</span>
//                         </label>
//                         <textarea className="form-control" defaultValue={'Efficient Productivity'} />
//                       </div>
//                       <div className="mb-0">
//                         <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
//                           <span className="status-label">Status</span>
//                           <input type="checkbox" id="user3" className="check" defaultChecked />
//                           <label htmlFor="user3" className="checktoggle" />
//                         </div>
//                       </div>
//                     </form>
//                   </div>
//                   <div className="modal-footer">
//                     <button type="button" className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">
//                       Cancel
//                     </button>
//                     <Link to="#" className="btn btn-primary fs-13 fw-medium p-2 px-3">
//                       Add Sub Category
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         {/* /Edit Category */}
//         <DeleteModal />
//       </>
//     </>
//   );
// };

// export default SubCategories;
