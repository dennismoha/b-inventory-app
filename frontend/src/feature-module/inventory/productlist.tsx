import { useEffect, useMemo, useState } from 'react';
import {
  MaterialReactTable,
  // type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
  type MRT_ColumnDef // If using TypeScript (optional, but recommended)
} from 'material-react-table';
import {
  useCreateProductMutation,
  useGetProductsQuery,
  useGetSubCategoriesQuery,
  useUpdateProductMutation,
  useDeleteProductMutation
} from '@core/redux/api/inventory-api';

import {
  Box,
  Button,
  //  IconButton,
  MenuItem
  // Tooltip
} from '@mui/material';

// import EditIcon from '@mui/icons-material/Edit';
import { useGetCategoriesQuery } from '@core/redux/api/inventory-api';
import { toast } from 'react-toastify';
import type { Category, Product, SubCategory } from '../interface/features-interface';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router';

export default function ProductList() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: response, isLoading, isError: isProductsError, error: productsError } = useGetProductsQuery('');

  // Fetch subcategories data
  const {
    data: subCategoriesResponse,
    isLoading: isSubCategoriesLoading,
    error: subCategoriesError,
    isError: isSubcategoriesError
  } = useGetSubCategoriesQuery();

  // Fetch categories data
  const { data: Categories, isLoading: IsCategoryLoading, isError: IsCategoryError, error: categoriesError } = useGetCategoriesQuery();

  // Mutation hook for updating product
  const [updateProduct, { isError: updatingIsProductError, error: updatingProductError, isSuccess: updatedProductSuccess }] =
    useUpdateProductMutation();

  // Mutation hook for creating product
  const [
    createProduct,
    { reset: resetCreateProduct, isError: creatingIsProductError, error: creatingProductError, isSuccess: createdProductSuccess }
  ] = useCreateProductMutation();
  // Mutation hook for deleting product
  const [deleteProduct, { isError: deletingIsProductError, error: deletingProductError, isSuccess: deletedProductSuccess }] =
    useDeleteProductMutation();
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const categories: Category[] = Categories ? Categories.data : [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const subcategories: SubCategory[] = subCategoriesResponse ? subCategoriesResponse.data : [];
  useEffect(() => {
    toast.dismiss();
    // Handling Products Query state
    if (isLoading) {
      toast.info('Fetching products...');
    }

    if (isProductsError && productsError) {
      if ('message' in productsError) {
        toast.error(`Error fetching products: ${productsError.message || ''}`);
      }
    }

    // Handling SubCategories Query state
    if (isSubCategoriesLoading) {
      toast.info('Fetching subcategories...');
    }

    if (subCategoriesError) {
      if ('message' in subCategoriesError) {
        toast.error(`Error fetching subcategories: ${subCategoriesError.message || ''}`);
      }
    }

    // Handling Categories Query state
    if (IsCategoryLoading) {
      toast.info('Fetching categories...');
    }

    if (IsCategoryError && categoriesError) {
      if ('message' in categoriesError) {
        toast.error(`Error fetching categories: ${categoriesError.message || ''}`);
      }
    }

    // Handling Update Product Mutation state
    if (updatingIsProductError && updatingProductError) {
      if ('message' in updatingProductError) {
        toast.error(`Error updating product: ${updatingProductError.message || ''}`);
      }
    }

    if (updatedProductSuccess) {
      toast.success('Product updated successfully!');
    }

    if (deletingIsProductError && deletingProductError) {
      if ('message' in deletingProductError) {
        toast.error(`Error deleting product: ${deletingProductError.message || ''}`);
      }
    }

    if (deletedProductSuccess) {
      toast.success('Product deleted successfully!');
    }

    // Handling Create Product Mutation state
    if (creatingIsProductError && creatingProductError) {
      console.log('creating product error ', creatingProductError, 'is error ', creatingIsProductError);
      if ('data' in creatingProductError) {
        //@ts-expect-error error ;
        toast.error(`Error ${creatingProductError.data.message || ''}`);
      }
    }

    if (createdProductSuccess) {
      toast.success('Product created successfully!');
    }
  }, [
    isLoading,
    isProductsError,
    productsError,
    isSubCategoriesLoading,
    subCategoriesError,
    IsCategoryLoading,
    IsCategoryError,
    categoriesError,
    updatingIsProductError,
    updatingProductError,
    updatedProductSuccess,
    creatingIsProductError,
    creatingProductError,
    createdProductSuccess,
    deletingIsProductError,
    deletingProductError,
    deletedProductSuccess
  ]);

  // Column definitions for Material React Table
  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'product_id',
        header: 'Product ID',
        enableEditing: false,
        size: 30,
        enableHiding: true,
        enablePinning: true,
        visibleInShowHideMenu: false
      },
      {
        accessorKey: 'name',
        header: 'Name',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.name,
          helperText: validationErrors?.name,
          onFocus: () => setValidationErrors({ ...validationErrors, name: undefined })
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
        accessorKey: 'category_id', // The key that stores the category ID
        header: 'Category',
        editVariant: 'select',
        muiEditTextFieldProps: {
          select: true,
          children: categories.map((category) => (
            <MenuItem key={category.categoryId} value={category.categoryId}>
              {category.category_name}
            </MenuItem>
          ))
        },
        Cell: ({ cell }) => {
          const category = categories.find((cat) => cat.categoryId === cell.getValue());
          return <div>{category ? category.category_name : 'Select a Category'}</div>;
        }
      },
      {
        accessorKey: 'subcategory_id',
        header: 'Subcategory',
        editVariant: 'select',
        muiEditTextFieldProps: {
          select: true,
          children: subcategories.map((subcategory) => (
            <MenuItem key={subcategory.subcategory_id} value={subcategory.subcategory_id}>
              {subcategory.subcategory_name}
            </MenuItem>
          ))
        },
        Cell: ({ cell }) => {
          const subcategory = subcategories.find((subcat) => subcat.subcategory_id === cell.getValue());
          return <div>{subcategory ? subcategory.subcategory_name : 'Select a Subcategory'}</div>;
        }
      }
      // {
      //   accessorKey: 'sku',
      //   header: 'SKU',
      //   muiTableHeadCellProps: { style: { color: 'green' } }
      // },
      // {
      //   accessorKey: 'image_url',
      //   header: 'Image url',
      //   muiTableHeadCellProps: { style: { color: 'green' } }
      // }
    ],
    [categories, subcategories, validationErrors]
  );

  const products: Product[] = response ? response.data : [];

  // Validation function
  const validateRequired = (value: string) => !!value.length;

  const validateProduct = (product: Product) => {
    return {
      name: !validateRequired(product.name) ? 'Name is required' : '',
      description: !validateRequired(product.description) ? 'Description is required' : ''
    };
  };

  // Handle row creation
  const handleCreateProduct: MRT_TableOptions<Product>['onCreatingRowSave'] = async ({ values }) => {
    const newValidationErrors = validateProduct(values);
    console.log('object validation errors ', newValidationErrors);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    resetCreateProduct();
    values = { ...values };
    delete values.product_id;
    delete values.sku;
    delete values.image_url;
    try {
      await createProduct(values).unwrap();
      table.setCreatingRow(null);
      resetCreateProduct();
    } catch (error) {
      console.log(error);
    }

    console.log('this is creating product error', creatingIsProductError);
    // if (!creatingIsProductError) {

    //   console.log('we are not creating product error', creatingIsProductError);
    //   // table.setCreatingRow(null); // Exit creating mode
    // }
  };

  // Handle row creation
  const handleUpdateProduct: MRT_TableOptions<Product>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateProduct(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    values = { ...values };
    console.log('values are ', values);

    try {
      await updateProduct(values).unwrap();
      table.setEditingRow(null); // Exit creating mode
    } catch (error) {
      console.log('error editing ', error);
    }
  };

  // const [deleteProduct] = useDeleteProductMutation();
  // Delete action handler
  // const openDeleteConfirmModal = (row: MRT_Row<Product>) => {
  //   if (window.confirm(`Are you sure you want to delete this product?${JSON.stringify({ product_id: row.id })}`)) {
  //     // Assuming a deleteProduct mutation action here (add implementation as needed)
  //     deleteProduct({ product_id: row.id });
  //     // dispatch(deleteProduct(row.original.product_id));
  //   }
  // };

  // Pass table options to useMaterialReactTable
  const table = useMaterialReactTable({
    columns,
    data: products || [], // Ensure data is memoized or stable
    displayColumnDefOptions: {
      'mrt-row-actions': {
        visibleInShowHideMenu: false //hide the built-in row actions column from the show hide menu
      }
    },
    // initialState: { columnVisibility: { product_id: false } }, //hide product_id column by default
    createDisplayMode: 'row', // Use row mode for creating rows
    editDisplayMode: 'row', // Use row mode for editing rows
    enableEditing: true,
    getRowId: (row) => row.product_id,
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateProduct,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleUpdateProduct,
    muiToolbarAlertBannerProps:
      isProductsError ||
      isSubcategoriesError ||
      IsCategoryError ||
      creatingIsProductError ||
      updatingIsProductError ||
      deletingIsProductError
        ? {
            color: 'error',
            children: JSON.stringify(
              productsError?.message ||
                subCategoriesError?.message ||
                categoriesError?.message ||
                creatingProductError?.message ||
                updatingProductError?.message ||
                deletingProductError?.message ||
                Object.values(validationErrors).join(', ') ||
                'An unknown error occurred.'
            )
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
        Create Product
      </Button>
    ),
    // renderRowActions: ({ row, table }) => (
    //   <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="edit-delete-action d-flex align-items-center ">
    //     <Tooltip title="Edit">
    //       <IconButton onClick={() => table.setEditingRow(row)} className="me-2 p-2 d-flex align-items-center border rounded">
    //         {/* <i className="feather icon-edit"></i> */}
    //         <EditIcon />
    //       </IconButton>
    //     </Tooltip>
    //     <Tooltip title="Delete">
    //       <IconButton
    //         color="error"
    //         onClick={() => openDeleteConfirmModal(row)}
    //         className="me-2 p-2 d-flex align-items-center border rounded"
    //       >
    //         <FontAwesomeIcon icon={faTrash} fontSize={18} data-bs-toggle="tooltip" title="fa fa-trash" />

    //         {/* <DeleteIcon /> */}
    //       </IconButton>
    //     </Tooltip>
    //   </Box>
    // ),

    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '0.5rem' }}>
        <Link className="me-2 p-2 d-flex align-items-center border rounded" to="#" onClick={() => table.setEditingRow(row)}>
          <i data-feather="edit" className="feather-edit" />
        </Link>
        <Link
          data-bs-toggle="modal"
          data-bs-target="#delete-product-modal"
          onClick={() => setDeleteId(row.original.product_id)}
          className="me-2 p-2 d-flex align-items-center border rounded error"
          to="#"
        >
          <i data-feather="trash-2" className="feather-trash-2" />
        </Link>
      </Box>
    ),
    state: {
      isLoading,
      // showAlertBanner: isProductsError
      showAlertBanner: creatingIsProductError
    }
  });

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  // Rendering the MaterialReactTable component
  return (
    <div className="page-wrapper">
      <div>{updatingIsProductError ? <p>{JSON.stringify(updatingProductError.message)}</p> : null}</div>
      <div className="content">
        <MaterialReactTable table={table} />
      </div>
      {/* Delete Modal */}
      <div className="modal fade" id="delete-product-modal">
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
                        await deleteProduct({ product_id: deleteId });
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
  // return (
  //   <>
  //     {!products || products.length === 0 ? <div>no products available</div> : null}
  //     <div className="page-wrapper">
  //       <div className="content">
  //         <div className="table-responsive">
  //           <MaterialReactTable table={table} />
  //         </div>
  //       </div>
  //     </div>
  //   </>
  // );
}

// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import Brand from '../../core/modals/inventory/brand';
// import { all_routes } from '../../routes/all_routes';
// import PrimeDataTable from '../../components/data-table';
// import {
//   expireProduct01,
//   expireProduct02,
//   expireProduct03,
//   expireProduct04,
//   stockImg02,
//   stockImg03,
//   stockImg04,
//   stockImg05,
//   stockImg06,
//   user04,
//   user08,
//   user10,
//   user13,
//   user30,
//   stockImg1,
//   user11,
//   user3,
//   user2,
//   user5,
//   user01
// } from '../../utils/imagepath';
// import TableTopHead from '../../components/table-top-head';
// import DeleteModal from '../../components/delete-modal';
// import SearchFromApi from '../../components/data-table/search';
// import { useGetProductsQuery } from '@core/redux/api/inventory-api';

// export const productlistdata = [
//   {
//     id: 1,
//     product: 'Lenovo 3rd Generatio',
//     productImage: stockImg1,
//     sku: 'PT001',
//     category: 'Laptop',
//     brand: 'Lenovo',
//     price: '$12500.00',
//     unit: 'Pc',
//     qty: '100',
//     createdby: 'Arroon',
//     img: user30
//   },
//   {
//     id: 2,
//     product: 'Bold V3.2',
//     productImage: stockImg06,
//     sku: 'PT002',
//     category: 'Electronics',
//     brand: 'Bolt',
//     price: '$1600.00',
//     unit: 'Pc',
//     qty: '140',
//     createdby: 'Kenneth',
//     img: user13
//   },
//   {
//     id: 3,
//     product: 'Nike Jordan',
//     productImage: stockImg02,
//     sku: 'PT003',
//     category: 'Shoe',
//     brand: 'Nike',
//     price: '$6000.00',
//     unit: 'Pc',
//     qty: '780',
//     createdby: 'Gooch',
//     img: user11
//   },
//   {
//     id: 4,
//     product: 'Apple Series 5 Watch',
//     productImage: stockImg03,
//     sku: 'PT004',
//     category: 'Electronics',
//     brand: 'Apple',
//     price: '$25000.00',
//     unit: 'Pc',
//     qty: '450',
//     createdby: 'Nathan',
//     img: user3
//   },
//   {
//     id: 5,
//     product: 'Amazon Echo Dot',
//     productImage: stockImg04,
//     sku: 'PT005',
//     category: 'Speaker',
//     brand: 'Amazon',
//     price: '$1600.00',
//     unit: 'Pc',
//     qty: '477',
//     createdby: 'Alice',
//     img: user2
//   },
//   {
//     id: 6,
//     product: 'Lobar Handy',
//     productImage: stockImg05,
//     sku: 'PT006',
//     category: 'Furnitures',
//     brand: 'Woodmart',
//     price: '$4521.00',
//     unit: 'Kg',
//     qty: '145',
//     createdby: 'Robb',
//     img: user5
//   },
//   {
//     id: 7,
//     product: 'Red Premium Handy',
//     productImage: expireProduct01,
//     sku: 'PT007',
//     category: 'Bags',
//     brand: 'Versace',
//     price: '$2024.00',
//     unit: 'Kg',
//     qty: '747',
//     createdby: 'Steven',
//     img: user08
//   },
//   {
//     id: 8,
//     product: 'Iphone 14 Pro',
//     productImage: expireProduct02,
//     sku: 'PT008',
//     category: 'Phone',
//     brand: 'Iphone',
//     price: '$1698.00',
//     unit: 'Pc',
//     qty: '897',
//     createdby: 'Gravely',
//     img: user04
//   },
//   {
//     id: 9,
//     product: 'Black Slim 200',
//     productImage: expireProduct03,
//     sku: 'PT009',
//     category: 'Chairs',
//     brand: 'Bently',
//     price: '$6794.00',
//     unit: 'Pc',
//     qty: '741',
//     createdby: 'Kevin',
//     img: user01
//   },
//   {
//     id: 10,
//     product: 'Woodcraft Sandal',
//     productImage: expireProduct04,
//     sku: 'PT010',
//     category: 'Bags',
//     brand: 'Woodcraft',
//     price: '$4547.00',
//     unit: 'Kg',
//     qty: '148',
//     createdby: 'Grillo',
//     img: user10
//   }
// ];

// interface ProductItem {
//   sku: string;
//   product: string;
//   productImage: string;
//   category: string;
//   brand: string;
//   price: string;
//   unit: string;
//   qty: string;
//   createdby: string;
//   img: string;
//   action?: string;
// }

// const ProductList: React.FC = () => {
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [totalRecords, _setTotalRecords] = useState<any>(5);
//   const [rows, setRows] = useState<number>(10);
//   const [_searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
//   const { data: response, isLoading, isError: isProductsError, error: productsError } = useGetProductsQuery('');

//   console.log('products are ', response);

//   const handleSearch = (value: any) => {
//     setSearchQuery(value);
//   };

//   const route = all_routes;
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
//       header: 'SKU',
//       field: 'sku',
//       key: 'sku',
//       sortable: true
//     },
//     {
//       header: 'Product',
//       field: 'product',
//       key: 'product',
//       sortable: true,
//       body: (data: ProductItem) => (
//         <div className="d-flex align-items-center">
//           <Link to="#" className="avatar avatar-md me-2">
//             <img alt="" src={data.productImage} />
//           </Link>
//           <Link to="#">{data.product}</Link>
//         </div>
//       )
//     },
//     {
//       header: 'Category',
//       field: 'category',
//       key: 'category',
//       sortable: true
//     },
//     {
//       header: 'Brand',
//       field: 'brand',
//       key: 'brand',
//       sortable: true
//     },
//     {
//       header: 'Price',
//       field: 'price',
//       key: 'price',
//       sortable: true
//     },
//     {
//       header: 'Unit',
//       field: 'unit',
//       key: 'unit',
//       sortable: true
//     },
//     {
//       header: 'Qty',
//       field: 'qty',
//       key: 'qty',
//       sortable: true
//     },
//     {
//       header: 'Created By',
//       field: 'createdby',
//       key: 'createdby',
//       sortable: true,
//       body: (data: ProductItem) => (
//         <span className="userimgname">
//           <Link to="/profile" className="product-img">
//             <img alt="" src={data.img} />
//           </Link>
//           <Link to="/profile">{data.createdby}</Link>
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
//                 <h4>Product List</h4>
//                 <h6>Manage your products</h6>
//               </div>
//             </div>
//             <TableTopHead />
//             <div className="page-btn">
//               <Link to={route.addproduct} className="btn btn-primary">
//                 <i className="ti ti-circle-plus me-1"></i>
//                 Add New Product
//               </Link>
//             </div>
//             <div className="page-btn import">
//               <Link to="#" className="btn btn-secondary color" data-bs-toggle="modal" data-bs-target="#view-notes">
//                 <i className="feather icon-download feather me-2" />
//                 Import Product
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
//                 <div className="dropdown me-2">
//                   <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
//                     Created By
//                   </Link>
//                   <ul className="dropdown-menu  dropdown-menu-end p-3">
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         James Kirwin
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Francis Chang
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Antonio Engle
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Leo Kelly
//                       </Link>
//                     </li>
//                   </ul>
//                 </div>
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
//                     Brand
//                   </Link>
//                   <ul className="dropdown-menu  dropdown-menu-end p-3">
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Lenovo
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Beats
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Nike
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Apple
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
//               {/* /Filter */}
//               <div className="table-responsive">
//                 {/* <Table columns={columns} dataSource={productlistdata} /> */}
//                 <PrimeDataTable
//                   column={columns}
//                   data={productlistdata}
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
//           <Brand />
//         </div>
//       </div>
//       <DeleteModal />
//     </>
//   );
// };

// export default ProductList;
