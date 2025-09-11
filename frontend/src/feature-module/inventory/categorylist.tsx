'use client';
import { useEffect, useMemo, useState } from 'react';

import {
  type LiteralUnion,
  MaterialReactTable,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
  type MRT_ColumnDef
} from 'material-react-table';
//import { getDefaultMRTOptions } from '@/app/(components)/material-table/index'; //your default options
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CommonFooter from '@components/footer/commonFooter';

import type { Category } from '../interface/features-interface';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation
} from '@core/redux/api/inventory-api';
import { toast } from 'react-toastify';

const CategoryProductTable = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const { data: categories, isLoading, isError } = useGetCategoriesQuery();
  const [createCategory, { isLoading: categoryIsLoading, isError: isCategoryError, error: categoryError }] = useCreateCategoryMutation();
  const [deleteCategory, { isLoading: deleting, isError: errorDeleting, isSuccess: deletedSuccessfully, error: deleteError }] =
    useDeleteCategoryMutation();
  const [updateCategory, { isLoading: updating, isError: updateError, error: updatecategoryError, isSuccess: updatedSuccessfully }] =
    useUpdateCategoryMutation();
  useEffect(() => {
    toast.dismiss();
    if (isLoading) {
      toast.info('fetching categories ....');
    }

    if (isError) {
      toast.error('error fetching categoris');
    }

    if (categoryIsLoading) {
      toast.info('creating categoy....');
    }

    if (isCategoryError) {
      toast.info('error creating categories');
    }
  }, [isLoading, isError, categoryIsLoading, isCategoryError]);

  useEffect(() => {
    toast.dismiss();
    if (updateError && updatecategoryError) {
      if ('data' in updatecategoryError) {
        //@ts-expect-error data.message is of type unknown
        toast.error(`${updatecategoryError.data.message}`);
      }

      if ('message' in updatecategoryError) {
        //@ts-expect-error message does not exist in fetchbasequery
        toast.error(`error updating categry , ${updateCategory.message}`);
      }

      toast.error('error in updating category');
    }

    if (updatedSuccessfully) {
      toast.success('category updated successfully');
    }
    if (deleting) {
      toast.info('deleting category');
    }

    if (errorDeleting) {
      toast.error(`error deleting category ${JSON.stringify(deleteError)}`);
    }

    if (deletedSuccessfully) {
      toast.info('category successfully deleted');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleting, errorDeleting, deletedSuccessfully, deleteError, updating, updateError, updatedSuccessfully, updatecategoryError]);

  const Categories: Category[] = categories ? categories.data : [];
  // Columns for category table
  const columns = useMemo<MRT_ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: 'categoryId', // Unique category identifier
        header: 'Category ID',
        enableEditing: false, // Disable editing for ID
        size: 160
      },
      {
        accessorKey: 'category_slug',
        header: 'Slug',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.category_slug,
          helperText: validationErrors?.category_slug,
          onFocus: () => setValidationErrors({ ...validationErrors, category_slug: undefined })
        }
      },
      {
        accessorKey: 'category_name',
        header: 'Category Name',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.category_name,
          helperText: validationErrors?.category_name,
          onFocus: () => setValidationErrors({ ...validationErrors, category_name: undefined })
        }
      },
      {
        accessorKey: 'description',
        header: 'Description',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.description,
          helperText: validationErrors?.description,
          onFocus: () => setValidationErrors({ ...validationErrors, description: undefined })
        }
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        enableEditing: false, // Disable editing for created_at
        size: 180
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated At',
        enableEditing: false, // Disable editing for updated_at
        size: 180
      }
    ],
    [validationErrors]
  );

  // Handle creating a category (mock function, integrate your own API call here)
  const handleCreateCategory: MRT_TableOptions<Category>['onCreatingRowSave'] = async ({ values, table }) => {
    // Validation logic (similar to your user validation)
    const newValidationErrors = validateCategory(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    // call category create mutation
    values = { ...values };
    delete values.categoryId;
    delete values.created_at;
    delete values.updated_at;
    await createCategory(values);

    table.setCreatingRow(null); // Close row creation
  };

  // Handle updating a category (mock function, integrate your own API call here)
  const handleSaveCategory: MRT_TableOptions<Category>['onEditingRowSave'] = async ({ values, table }) => {
    // Validation logic (similar to your user validation)
    const newValidationErrors = validateCategory(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    // Integrate with your API to update the category (mock API call)
    values = { ...values };

    delete values.created_at;
    delete values.updated_at;
    updateCategory(values);
    table.setEditingRow(null); // Close row editing
  };

  // Handle deleting a category (mock function, integrate your own API call here)
  const openDeleteConfirmModal = (row: MRT_Row<Category>) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      // Integrate with your API to delete the category (mock API call)
      console.log('Deleting category:', row.original.categoryId);
      const categoryId = row.original.categoryId;
      deleteCategory(categoryId);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: Categories || [], // Pass your categories data
    createDisplayMode: 'row', // Open the row for creating a new category
    editDisplayMode: 'row', // Use row-level editing for category
    enableEditing: true,
    getRowId: (row) => row.categoryId, // Ensure row has a unique id
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateCategory,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveCategory,

    muiToolbarAlertBannerProps: isCategoryError
      ? {
          color: 'error',
          children: JSON.stringify(categoryError.message)
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
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true); // Open the create row modal
        }}
      >
        Create New Category
      </Button>
    ),
    state: {
      isLoading: false, // Handle loading state (integrate with your state)
      isSaving: false, // Handle saving state (integrate with your state)
      showAlertBanner: isCategoryError,
      showProgressBars: false
    }
  });

  // return <MaterialReactTable table={table} />;
  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-title">
            <h4 className="fw-bold">Units</h4>
            <h6>Manage your units</h6>

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
};

// Validation function for category
const validateCategory = (
  category: Record<
    LiteralUnion<
      | 'Products'
      | 'description'
      | 'created_at'
      | 'updated_at'
      | 'categoryId'
      | 'category_slug'
      | 'category_name'
      | 'Products.subcategory_id'
      | 'Products.description'
      | 'Products.created_at'
      | 'Products.updated_at'
      | 'Products.category'
      | 'Products.product_id'
      | 'Products.name'
      | 'Products.category_id'
      | 'Products.image_url'
      | 'Products.sku'
      | 'Products.subcategory'
      | 'Products.category.Products'
      | 'Products.category.description'
      | 'Products.category.created_at'
      | 'Products.category.updated_at'
      | 'Products.category.categoryId'
      | 'Products.category.category_slug'
      | 'Products.category.category_name'
      | 'Products.subcategory.Products'
      | 'Products.subcategory.subcategory_id'
      | 'Products.subcategory.subcategory_name'
      | 'Products.subcategory.description'
      | 'Products.subcategory.created_at'
      | 'Products.subcategory.updated_at'
      | 'Products.subcategory.category'
      | 'Products.subcategory.category.Products'
      | 'Products.subcategory.category.description'
      | 'Products.subcategory.category.created_at'
      | 'Products.subcategory.category.updated_at'
      | 'Products.subcategory.category.categoryId'
      | 'Products.subcategory.category.category_slug'
      | 'Products.subcategory.category.category_name',
      string
    >,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >
) => {
  return {
    category_name: !category.category_name ? 'Category Name is Required' : '',
    category_slug: !category.category_slug ? 'Category Slug is Required' : '',
    description: !category.description ? 'Description is Required' : ''
  };
};

export default CategoryProductTable;

// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import EditCategoryList from '../../core/modals/inventory/editcategorylist';
// import CommonFooter from '../../components/footer/commonFooter';
// import PrimeDataTable from '../../components/data-table';
// import TableTopHead from '../../components/table-top-head';
// import DeleteModal from '../../components/delete-modal';
// import SearchFromApi from '../../components/data-table/search';
// import { useGetCategoriesQuery } from '@core/redux/api/inventory-api';

// // Define interfaces for type safety
// interface CategoryItem {
//   category: string;
//   categoryslug: string;
//   createdon: string;
//   status: string;
// }

// interface RootState {
//   rootReducer: {
//     categotylist_data: CategoryItem[];
//   };
// }

// const CategoryList: React.FC = () => {
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [totalRecords, _setTotalRecords] = useState<any>(5);
//   const [rows, setRows] = useState<number>(10);
//   const [_searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
//   const { data: categories, isLoading, isError } = useGetCategoriesQuery();

//   console.log('categories are ', categories);

//   const handleSearch = (value: any) => {
//     setSearchQuery(value);
//   };
//   const dataSource: CategoryItem[] = useSelector((state: RootState) => state.rootReducer.categotylist_data);

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
//       header: 'Category',
//       field: 'category',
//       key: 'category',
//       sortable: true
//     },
//     {
//       header: 'Category Slug',
//       field: 'categoryslug',
//       key: 'categoryslug',
//       sortable: true
//     },
//     {
//       header: 'Created On',
//       field: 'createdon',
//       key: 'createdon',
//       sortable: true
//     },
//     {
//       header: 'Status',
//       field: 'status',
//       key: 'status',
//       sortable: true,
//       body: (data: CategoryItem) => <span className="badge bg-success fw-medium fs-10">{data.status}</span>
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
//     <div>
//       <div className="page-wrapper">
//         <div className="content">
//           <div className="page-header">
//             <div className="add-item d-flex">
//               <div className="page-title">
//                 <h4 className="fw-bold">Category</h4>
//                 <h6>Manage your categories</h6>
//               </div>
//             </div>
//             <TableTopHead />
//             <div className="page-btn">
//               <Link to="#" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-category">
//                 <i className="ti ti-circle-plus me-1"></i>
//                 Add Category
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
//               <div className="table-responsive category-table">
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

//       {/* Add Category */}
//       <div className="modal fade" id="add-category">
//         <div className="modal-dialog modal-dialog-centered">
//           <div className="modal-content">
//             <div className="page-wrapper-new p-0">
//               <div className="content">
//                 <div className="modal-header">
//                   <div className="page-title">
//                     <h4>Add Category</h4>
//                   </div>
//                   <button type="button" className="close bg-danger text-white fs-16" data-bs-dismiss="modal" aria-label="Close">
//                     <span aria-hidden="true">×</span>
//                   </button>
//                 </div>
//                 <div className="modal-body">
//                   <form>
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Category<span className="text-danger ms-1">*</span>
//                       </label>
//                       <input type="text" className="form-control" />
//                     </div>
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Category Slug<span className="text-danger ms-1">*</span>
//                       </label>
//                       <input type="text" className="form-control" />
//                     </div>
//                     <div className="mb-0">
//                       <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
//                         <span className="status-label">
//                           Status<span className="text-danger ms-1">*</span>
//                         </span>
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
//                   <Link to="#" data-bs-dismiss="modal" className="btn btn-primary fs-13 fw-medium p-2 px-3">
//                     Add Category
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* /Add Category */}

//       <EditCategoryList />
//       <DeleteModal />
//     </div>
//   );
// };

// export default CategoryList;
