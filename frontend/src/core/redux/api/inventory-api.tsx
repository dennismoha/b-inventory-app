/* eslint-disable react-refresh/only-export-components */
import type { UnitApiResponse } from '@core/interface';
import type {
  Account,
  Category,
  CategoryResponse,
  CreatePurchaseRequest,
  CurrentUserType,
  Customer,
  InventoryItem,
  InventoryItemsApiResponse,
  InventoryRestock,
  NewCustomerPayload,
  NewInventoryItemPayload,
  NewProductPayload,
  NewSupplierProductPayload,
  NewTransactionPayload,
  Product,
  ProductApiResponse,
  SubCategory,
  SubCategoryApiResponse,
  Supplier,
  SupplierPricing,
  SupplierPricingPayload,
  SupplierPricingResponse,
  SupplierProduct,
  SupplierProductsApiResponse,
  SuppplierApiResponse,
  Transaction,
  // TransactionProductItems,
  Unit,
  UnitBodyPayload,
  BatchPayableResult,
  FormattedBatchInventory,
  CashbookLedgerRecords,
  ProductPricing,
  NewProductPricingPayload,
  Employee,
  NewEmployeePayload,
  // EmployeesApiResponse,
  AssetsApiResponse,
  NewAssetPayload,
  Asset,
  ExpensesApiResponse,
  Expense,
  NewExpensePayload,
  CashflowStatement,
  ProfitAndLossResponse,
  BalanceSheetResponse,
  LowStockResponseItem,
  StockResponseItem,
  TrialBalance,
  pos_session_header,
  TransactionProductsBetweenDates,
  CustomerSalesResponse,
  purchaseList,
  deleteMessage,
  PurchaseEditPayload
  // PurchasePayableResponse,
  // purchasePayable
} from '@/feature-module/interface/features-interface';

import type { ApiResponse } from '@/utils/api';
import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@core/redux/store';
import { setClearCredentials } from '../authslice';
import type { ProductItems } from '../cart';
import type { DeletePurchasePayload, PurchasePayload } from '@/feature-module/purchases/components/modals/create-purchase-list';

interface ApiError {
  statusCode: number;
  status: string;
  message: string;
}

const rawBaseQuery = fetchBaseQuery({
  // baseUrl: 'http://localhost:8081/api/v1/',
  baseUrl: import.meta.env.VITE_APP_PUBLIC_API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const pos_session: { pos_session_id: string } | null = (getState() as RootState).PosSession.posSessionId;
    console.log('pos session is .', pos_session?.pos_session_id);
    if (pos_session) {
      headers.set('pos_session', pos_session?.pos_session_id);
    }
    return headers;
  }
});

export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, ApiError> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  // Handle auth expiry
  if (result.error && result.error.status === 401) {
    api.dispatch(setClearCredentials());
  }

  const httpStatus = result.meta?.response?.status;
  if (result.error?.status === 'PARSING_ERROR' && httpStatus === 403) {
    return {
      error: {
        statusCode: 403,
        status: 'error',
        message: 'Forbidden'
      },
      data: undefined
    };
  }

  //  Normalize errors from server
  if (result.error && 'data' in result.error) {
    const err = result.error as FetchBaseQueryError & {
      data: { message: string; statusCode?: number; status?: string };
    };

    return {
      error: {
        statusCode: err.data.statusCode ?? (err.status as number),
        status: err.data.status ?? 'error',
        message: err.data.message
      },
      data: undefined
    };
  }

  // If there is a FetchBaseQueryError, convert it to ApiError
  if (result.error) {
    const err = result.error as FetchBaseQueryError;
    return {
      error: {
        statusCode: typeof err.status === 'number' ? err.status : 500,
        status: 'error',
        message:
          typeof err.data === 'string'
            ? err.data
            : err.data && typeof err.data === 'object' && 'message' in err.data
              ? (err.data as { message: string }).message
              : 'Unknown error'
      },
      data: undefined
    };
  }

  // Success
  return {
    data: result.data,
    error: undefined,
    meta: result.meta
  };
};

export const InventoryApi = createApi({
  // baseQuery: async (args, api, extraOptions) => {
  //   const rawBaseQuery = fetchBaseQuery({
  //     baseUrl: 'http://localhost:8081/api/v1/',
  //     credentials: 'include',
  //     prepareHeaders: (headers, { getState }) => {
  //       const pos_session = (getState() as RootState).PosSession.posSessionId;
  //       console.log('pos session is ', pos_session);
  //       console.log('pos session 2 is ', pos_session?.pos_session_id);

  //       // if (pos_session) {
  //       //   headers.set('pos_session', pos_session);
  //       // }
  //       if (pos_session?.pos_session_id) {
  //         headers.set('pos_session', pos_session.pos_session_id);
  //       }
  //       return headers;
  //     }
  //   });

  //   const result = await rawBaseQuery(args, api, extraOptions);

  //   if (result.error && result.error.status === 401) {
  //     console.log('error is ', result.error);
  //     api.dispatch(setClearCredentials());

  //     // api.dispatch(InventoryApi.util.resetApiState()); // ✅ use the actual API slice
  //   }
  //   const httpStatus = result.meta?.response?.status;

  //   if (result.error?.status === 'PARSING_ERROR' && httpStatus === 403) {
  //     // api.dispatch(setClearCredentials());
  //     console.error('Access forbidden (403): You do not have permission to access this resource.');
  //     return {
  //       error: {
  //         status: 403,
  //         data: 'Forbidden'
  //       }
  //     };
  //   }

  //   console.log('Headers sent:', args);
  //   console.log('Result:', result);
  //   return result;
  // },
  baseQuery: baseQuery,
  reducerPath: 'inventoryApi',
  tagTypes: [
    'DashboardMetrics',
    'currentuser',
    'Products',
    'Users',
    'Expenses',
    'categories',
    'SubCategory',
    'Units',
    'Suppliers',
    'SupplierPricing',
    'SupplierProducts',
    'orders',
    'orderProducts',
    'Miscellaneous',
    'InventoryItems',
    'ProductPricing',
    'Transactions',
    'Customers',
    'TotalSales',
    'SalesByDateRange',
    'ProductSales',
    'ProductSalesByDateRange',
    'CustomerSales',
    'CustomerSalesByDateRange',
    'InventorySalesDifference',
    'ProfitCalculation',
    'salesBetweenproductsdates',
    'InventoryItemsInsight',
    'Transactions-insights',
    'PosSession',
    'Accounts',
    'Purchases',
    'Cashbookledger',
    'Employees',
    'Assets',
    'Expenses',
    'Reports',
    'Stock',
    'trial-balance'
  ],
  endpoints: () => ({})
});

export const AuthAPI = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // Example endpoint for user authentication
    login: build.mutation<
      { message: string; token: string; user: { email: string; username: string; role: string; posSession: string } },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials
      }),
      invalidatesTags: ['Users']
    }),
    logout: build.query<void, void>({
      query: () => ({
        url: '/logout'
        // method: 'PO'
      })
    }),
    getCurrentUser: build.query<CurrentUserType, void>({
      query: () => '/currentuser' // check if current user existst
      // providesTags: ['currentuser'],
      // keepUnusedDataFor: 30000
    })
  })
});

// purchase
const PurchaseApi = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // Fetch all purchases
    getPurchases: build.query<ApiResponse<purchaseList[]>, void>({
      query: () => '/purchase',
      providesTags: ['Purchases']
    }),

    // // Fetch a specific purchase by ID
    // getPurchaseById: build.query<ApiResponse<any>, string>({
    //   query: (purchaseId) => `/purchases/${purchaseId}`,
    //   providesTags: ['Purchases']
    // }),

    // // Create a new purchase
    createPurchase: build.mutation<ApiResponse<Partial<CreatePurchaseRequest>>, Partial<PurchasePayload>>({
      query: (newPurchase) => ({
        url: '/purchase',
        method: 'POST',
        body: newPurchase
      }),
      invalidatesTags: ['Purchases', 'InventoryItems']
    }),

    // // Update an existing purchase
    updatePurchase: build.mutation<ApiResponse<[]>, { purchaseId: string; patch: PurchaseEditPayload }>({
      query: ({ _purchaseId, ...patch }) => ({
        // url: `/purchases/${purchaseId}`,
        url: `/purchases/`,
        method: 'PUT',
        body: patch
      }),
      invalidatesTags: ['Purchases']
    }),

    // Delete a purchase
    // deletePurchase: build.mutation<void, string>({
    //   query: (purchaseId) => ({
    //     url: `/purchase/${purchaseId}`,
    //     method: 'DELETE'
    //   }),
    //   invalidatesTags: ['Purchases']
    // }),

    deletePurchase: build.mutation<deleteMessage, Partial<DeletePurchasePayload>>({
      query: (newPurchase) => ({
        url: '/purchase',
        method: 'DELETE',
        body: newPurchase
      }),
      invalidatesTags: ['Purchases', 'InventoryItems']
    })
  }),
  overrideExisting: false
});

const PurchaseBatchPayablesApi = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // Fetch all purchase batch payables
    getPurchaseBatchPayables: build.query<ApiResponse<BatchPayableResult[]>, void>({
      query: () => '/purchase-payables',
      providesTags: ['Purchases']
    }),
    // Create a new purchase batch payable
    createPurchaseBatchPayable: build.mutation({
      query: ({ purchase_id, ...patch }) => ({
        url: `/purchase-payables/purchase/${purchase_id}`,
        method: 'PUT',
        body: patch,
        invalidatesTags: ['Purchases']
      })
    })

    // // Update a purchase batch payable
    // updatePurchaseBatchPayable: build.mutation<ApiResponse<any>, { id: string; patch: Partial<any> }>({
    //   query: ({ id, patch }) => ({
    //     url: `/purchase-batch-payables/${id}`,
    //     method: 'PUT',
    //     body: patch
    //   }),
    //   invalidatesTags: ['Purchases']
    // }),
    // // Delete a purchase batch payable
    // deletePurchaseBatchPayable: build.mutation<void, string>({
    //   query: (id) => ({
    //     url: `/purchase-batch-payables/${id}`,
    //     method: 'DELETE'
    //   }),
    //   invalidatesTags: ['Purchases']
    // })
  }),
  overrideExisting: false
});

const CashBookInventoryAPI = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    getCashBookRecords: build.query<ApiResponse<CashbookLedgerRecords[]>, void>({
      query: () => '/cashbook-ledger',
      providesTags: ['Cashbookledger']
    })
  })
});

const BatchInventoriesApi = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // Fetch all batch inventories
    getBatchInventories: build.query<ApiResponse<FormattedBatchInventory[]>, void>({
      query: () => '/batch-inventories',
      providesTags: ['InventoryItems']
    })

    // // Fetch a specific batch inventory by ID
    // getBatchInventoryById: build.query<ApiResponse<any>, string>({
    //   query: (batchInventoryId) => `/batch-inventories/${batchInventoryId}`,
    //   providesTags: ['InventoryItems']
    // }),

    // // Create a new batch inventory
    // createBatchInventory: build.mutation<ApiResponse<any>, any>({
    //   query: (newBatchInventory) => ({
    //     url: '/batch-inventories',
    //     method: 'POST',
    //     body: newBatchInventory
    //   }),
    //   invalidatesTags: ['InventoryItems']
    // }),

    // // Update an existing batch inventory
    // updateBatchInventory: build.mutation<ApiResponse<any>, { batchInventoryId: string; patch: Partial<any> }>({
    //   query: ({ batchInventoryId, patch }) => ({
    //     url: `/batch-inventories/${batchInventoryId}`,
    //     method: 'PUT',
    //     body: patch
    //   }),
    //   invalidatesTags: ['InventoryItems']
    // }),

    // // Delete a batch inventory
    // deleteBatchInventory: build.mutation<void, string>({
    //   query: (batchInventoryId) => ({
    //     url: `/batch-inventories/${batchInventoryId}`,
    //     method: 'DELETE'
    //   }),
    //   invalidatesTags: ['InventoryItems']
    // })
  }),
  overrideExisting: false
});

// Accounts
export const AccountsAPI = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // Create new account
    createAccount: build.mutation<ApiResponse<Account>, Partial<Account>>({
      query: (newAccount) => ({
        url: '/accounts',
        method: 'POST',
        body: newAccount
      }),
      invalidatesTags: ['Accounts']
    }),

    // Get all accounts
    getAccounts: build.query<ApiResponse<Account[]>, void>({
      query: () => ({
        url: '/accounts',
        method: 'GET'
      }),
      providesTags: ['Accounts']
    }),
    // Get all accounts
    getAccountsTrialBalance: build.query<ApiResponse<TrialBalance>, void>({
      query: () => ({
        url: '/accounts/trial-balances',
        method: 'GET'
      }),
      providesTags: ['trial-balance']
    }),

    // Get account by ID
    // getAccountById: build.query<any, string>({
    //   query: (accountId) => ({
    //     url: `/accounts/${accountId}`,
    //     method: 'GET'
    //   })
    //   // providesTags: (result, error, id) => [{ type: 'Accounts', id }]
    // }),

    // Update account status
    updateAccountStatus: build.mutation({
      query: ({ accountId, status }) => ({
        url: `/accounts/status/${accountId}`,
        method: 'PUT',
        body: { status }
      })
      // invalidatesTags: (result, error, { accountId }) => [{ type: 'Accounts', id: accountId }]
    }),

    // Update account
    updateAccount: build.mutation({
      query: ({ account_id, ...update }) => ({
        url: `/accounts/${account_id}`,
        method: 'PUT',
        body: update
      })
      // invalidatesTags: (result, error, { accountId }) => [{ type: 'Accounts', id: accountId }]
    }),
    // Soft delete account
    deleteAccount: build.mutation<void, string>({
      query: (accountId) => ({
        url: `/accounts/${accountId}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'Accounts' }]
      // invalidatesTags: (result, error, id) => [{ type: 'Accounts', id }]
    })
  })
});

export const PosSessionAPI = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // Start a new POS session
    startPosSession: build.mutation({
      query: () => ({
        url: '/pos/session/open',
        method: 'POST'
      }),
      invalidatesTags: ['PosSession']
    }),

    // Check if an active POS session exists
    checkPosSession: build.query<ApiResponse<pos_session_header>, void>({
      query: () => ({
        url: '/pos/session/fetch',
        method: 'GET'
      }),
      providesTags: ['PosSession']
    }),

    // Close POS session
    closePosSession: build.mutation({
      query: () => ({
        url: '/pos/session/close',
        method: 'POST'
      }),
      invalidatesTags: ['PosSession']
    })
  })
});

const CategoryApi = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<CategoryResponse, void>({
      query: () => '/categories', // Fetch categories from the 'categories' endpoint
      providesTags: ['categories'],
      keepUnusedDataFor: 300000
    }),
    createCategory: build.mutation<CategoryResponse, Category>({
      query: (Category) => ({
        url: '/categories',
        method: 'POST',
        body: Category
      }),
      invalidatesTags: [{ type: 'categories' }]
    }),

    updateCategory: build.mutation<CategoryResponse, Pick<Category, 'categoryId'>>({
      query: ({ categoryId, ...patch }) => ({
        url: `/categories/${categoryId}`,
        method: 'PUT',
        body: patch
      }),
      invalidatesTags: ['SubCategory', 'categories']
    }),
    deleteCategory: build.mutation<void, string>({
      query: (categoryId) => ({
        url: `/categories/${categoryId}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'categories' }]
    }),

    getSubCategories: build.query<SubCategoryApiResponse, void>({
      query: () => '/subcategories', // API endpoint for fetching subcategories
      providesTags: ['SubCategory'] // Cache invalidation for this query
    }),
    getSubCategoryById: build.query<SubCategory, string>({
      query: (subcategoryId) => `/subcategories/${subcategoryId}`, // Fetch by ID

      // Optionally, set a `keepUnusedDataFor` time (default is 60 seconds)
      keepUnusedDataFor: 300000, // Keep unused data for 5 minutes before removal
      providesTags: ['SubCategory']
    }),
    createSubCategory: build.mutation<SubCategory, Partial<SubCategory>>({
      query: (newSubCategory) => ({
        url: '/subcategories',
        method: 'POST',
        body: newSubCategory
      }),
      // Invalidates all queries related to subcategories (trigger refetch)
      invalidatesTags: [{ type: 'SubCategory' }]
    }),
    updateSubCategory: build.mutation<SubCategory, Pick<SubCategory, 'subcategory_id'>>({
      query: ({ subcategory_id, ...patch }) => ({
        url: `/subcategories/${subcategory_id}`,
        method: 'PUT',
        body: patch
      }),
      invalidatesTags: ['SubCategory']
    }),
    deleteSubCategory: build.mutation<void, string>({
      query: (subcategoryId) => ({
        url: `/subcategories/${subcategoryId}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'SubCategory' }]
    })
  })
});

const ProductsApi = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<ProductApiResponse, string | void>({
      query: (search) => ({
        url: '/products',
        params: search ? { search } : {}
      }),
      providesTags: ['Products']
    }),
    createProduct: build.mutation<Product, NewProductPayload>({
      query: (newProduct) => ({
        url: '/products',
        method: 'POST',
        body: newProduct
      }),
      invalidatesTags: ['Products']
    }),
    // Update a product
    updateProduct: build.mutation<Product, Pick<Product, 'product_id'>>({
      query: ({ product_id, ...patch }) => ({
        url: `/products/${product_id}`,
        method: 'PUT', // Using PUT to update the product
        body: patch // The product data to be updated
      }),
      invalidatesTags: [{ type: 'Products' }]
    }),

    // updateProducts: build.mutation<
    //   Product,
    //   { product_id: string; payload: Partial<Product> }
    // >({

    //   query: ({ product_id, payload }) => ({
    //     url: `/products/${product_id}`,
    //     method: "PUT", // Using PUT to update the product
    //     body: payload, // The product data to be updated
    //   }),
    //   // Invalidating the cache so the product list is re-fetched after updating
    //   invalidatesTags: [{ type: "Products" }],
    // }),

    // Delete a product
    deleteProduct: build.mutation<void, { product_id: string }>({
      query: ({ product_id }) => {
        console.log('product id is ', product_id);
        return {
          url: `/products/${product_id}`,
          method: 'DELETE' // Using DELETE to remove the product
        };
      },
      // Invalidates the cache after deleting a product
      invalidatesTags: [{ type: 'Products' }]
    })
  }),
  overrideExisting: true
});

const UnitApi = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // Fetch a list of units
    getUnits: build.query<UnitApiResponse, string | void>({
      query: (search) => ({
        url: '/units',
        params: search ? { search } : {}
      }),
      providesTags: ['Units']
    }),

    // Create a new unit
    createUnit: build.mutation<UnitApiResponse, UnitBodyPayload>({
      query: (newUnit) => ({
        url: '/units',
        method: 'POST',
        body: newUnit
      }),
      invalidatesTags: ['Units', 'SupplierPricing']
    }),

    // Update an existing unit
    updateUnit: build.mutation<Unit, Pick<Unit, 'unit_id'>>({
      query: ({ unit_id, ...patch }) => ({
        url: `/units/${unit_id}`,
        method: 'PUT',
        body: patch
      }),
      invalidatesTags: ['Units', 'SupplierPricing']
    }),

    // Delete a unit
    deleteUnit: build.mutation<void, { unit_id: string }>({
      query: ({ unit_id }) => ({
        url: `/units/${unit_id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Units']
    })
  }),
  overrideExisting: true // Allow overriding any existing endpoints
});

// suppliers
const SupplierApi = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // Fetch suppliers
    getSuppliers: build.query<SuppplierApiResponse, string | void>({
      query: (search) => ({
        url: '/suppliers',
        params: search ? { search } : {}
      }),
      providesTags: ['Suppliers']
    }),

    // Create a new supplier
    createSupplier: build.mutation<Supplier, Omit<Supplier, 'supplier_id'>>({
      query: (newSupplier) => ({
        url: '/suppliers',
        method: 'POST',
        body: newSupplier
      }),
      invalidatesTags: ['Suppliers']
    }),

    // Update an existing supplier
    updateSupplier: build.mutation<Supplier, Pick<Supplier, 'supplier_id'>>({
      query: ({ supplier_id, ...patch }) => ({
        url: `/suppliers/${supplier_id}`,
        method: 'PUT',
        body: patch
      }),
      invalidatesTags: ['Suppliers', 'SupplierPricing']
    }),

    // Delete a supplier
    deleteSupplier: build.mutation<void, { supplier_id: string }>({
      query: ({ supplier_id }) => ({
        url: `/suppliers/${supplier_id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Suppliers']
    })
  }),
  overrideExisting: true
});

// Supplier Pricing.
const SupplierPricingApi = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // Fetch supplier pricing
    getSupplierPricing: build.query<SupplierPricingResponse, string | void>({
      query: (search) => ({
        url: '/supplier-pricing',
        params: search ? { search } : {}
      }),
      providesTags: ['SupplierPricing']
    }),

    // Create supplier pricing
    createSupplierPricing: build.mutation<SupplierPricing, SupplierPricingPayload>({
      query: (newPricing) => ({
        url: '/supplier-pricing',
        method: 'POST',
        body: newPricing
      }),
      invalidatesTags: ['SupplierPricing']
    }),

    // Update supplier pricing
    updateSupplierPricing: build.mutation<SupplierPricing, Pick<SupplierPricing, 'supplier_pricing'>>({
      query: ({ supplier_pricing, ...patch }) => ({
        url: `/supplier-pricing/${supplier_pricing}`,
        method: 'PUT',
        body: patch
      }),
      invalidatesTags: ['SupplierPricing']
    }),

    // Delete supplier pricing
    deleteSupplierPricing: build.mutation<void, { supplier_pricing: string }>({
      query: ({ supplier_pricing }) => ({
        url: `/supplier-pricing/${supplier_pricing}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['SupplierPricing']
    })
  }),
  overrideExisting: true
});

// supplier product
const SupplierProductApi = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // Fetch supplier products
    getSupplierProducts: build.query<SupplierProductsApiResponse, string | void>({
      query: (search) => ({
        url: '/supplier-products',
        params: search ? { search } : {}
      }),
      providesTags: ['SupplierProducts']
    }),

    // Create a new supplier product
    createSupplierProduct: build.mutation<SupplierProduct, NewSupplierProductPayload>({
      query: (newSupplierProduct) => ({
        url: '/supplier-products',
        method: 'POST',
        body: newSupplierProduct
      }),
      invalidatesTags: ['SupplierProducts', 'Suppliers']
    }),

    // Update an existing supplier product
    updateSupplierProduct: build.mutation<SupplierProduct, { supplier_products_id: string; patch: Partial<SupplierProduct> }>({
      query: ({ supplier_products_id, patch }) => ({
        url: `/supplier-products/${supplier_products_id}`,
        method: 'PUT',
        body: patch
      }),
      invalidatesTags: ['SupplierProducts']
    }),

    // Delete a supplier product
    deleteSupplierProduct: build.mutation<void, { supplier_products_id: string }>({
      query: ({ supplier_products_id }) => ({
        url: `/supplier-products/${supplier_products_id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['SupplierProducts']
    })
  }),
  overrideExisting: true
});

// // orders

// const OrderApi = InventoryApi.injectEndpoints({
//   endpoints: (build) => ({
//     // Get a list of orders
//     getOrders: build.query<OrderResponse, void>({
//       query: () => '/orders', // Fetch orders from the 'orders' endpoint
//       providesTags: ['orders'], // Cache tags for invalidation
//       keepUnusedDataFor: 300000 // Keep unused data for 5 minutes
//     }),

//     // Create a new order
//     createOrder: build.mutation<OrderResponse, Order>({
//       query: (order) => ({
//         url: '/orders',
//         method: 'POST',
//         body: order // Send the order object in the body of the request
//       }),
//       // Invalidate queries related to orders to trigger a refetch
//       invalidatesTags: [{ type: 'orders' }]
//     }),

//     // Delete an order by its ID
//     deleteOrder: build.mutation<void, string>({
//       query: (orderId) => ({
//         url: `/orders/${orderId}`,
//         method: 'DELETE'
//       }),
//       // Invalidate all queries related to orders
//       invalidatesTags: [{ type: 'orders' }]
//     }),

//     // Get details of a specific order by its ID
//     getOrderById: build.query<Order, string>({
//       query: (orderId) => `/orders/${orderId}`, // Fetch the order by ID
//       providesTags: ['orders'] // Cache invalidation for this query
//     }),

//     // Update an existing order by its ID
//     updateOrder: build.mutation<Order, Pick<Order, 'orderId'>>({
//       query: ({ orderId, ...patch }) => ({
//         url: `/orders/${orderId}`,
//         method: 'PUT',
//         body: patch // Send the updates in the request body
//       }),
//       invalidatesTags: ['orders'] // Invalidate cache for orders after update
//     })
//   })
// });

// // order-products

// const OrderProductApi = InventoryApi.injectEndpoints({
//   endpoints: (build) => ({
//     // Get all order-products  - there is no backend endpoint for this
//     getOrderProducts: build.query<OrderProductResponse, void>({
//       query: () => '/order-products', // Fetch all order-products from the 'order-products' endpoint
//       providesTags: ['orderProducts'], // Cache tags for invalidation
//       keepUnusedDataFor: 300000 // Keep unused data for 5 minutes
//     }),

//     // Get an order-product by ID  - no backend endpoint for this at the moment
//     getOrderProductById: build.query<OrderProductResponse, Pick<Order, 'orderId'>>({
//       query: (orderProductId) => `/order-products/${orderProductId}`, // Fetch order-product by ID
//       providesTags: ['orderProducts'] // Cache invalidation for this query
//     }),

//     // Get an order-product by orderID
//     getOrderProductByOrderId: build.query<OrderProductResponse, Pick<Order, 'orderId'>>({
//       query: (orderId) => `/order-products/${orderId}`, // Fetch order-product by ID
//       providesTags: ['orderProducts'] // Cache invalidation for this query
//     }),

//     // Create a new order-product
//     createOrderProduct: build.mutation<OrderProductResponse, OrderProducts>({
//       query: (orderProduct) => ({
//         url: '/order-products',
//         method: 'POST',
//         body: orderProduct // Send the order-product data in the body
//       }),
//       invalidatesTags: [{ type: 'orderProducts' }] // Invalidate queries related to order-products to trigger a refetch
//     }),

//     // Update an existing order-product
//     updateOrderProduct: build.mutation<OrderProducts, { orderProductId: string; patch: Partial<OrderProducts> }>({
//       query: ({ orderProductId, patch }) => ({
//         url: `/order-products/${orderProductId}`,
//         method: 'PUT',
//         body: patch // Send the updated order-product data
//       }),
//       invalidatesTags: ['orderProducts'] // Invalidate the cache after updating
//     }),

//     // Delete an order-product by its ID
//     deleteOrderProduct: build.mutation<void, string>({
//       query: (orderProductId) => ({
//         url: `/order-products/${orderProductId}`,
//         method: 'DELETE' // Delete the order-product by ID
//       }),
//       invalidatesTags: ['orderProducts', 'orders'] // Invalidate queries related to order-products to trigger a refetch
//     })
//   })
// });

// const MiscellaneousApi = InventoryApi.injectEndpoints({
//   endpoints: (build) => ({
//     // Fetch all miscellaneous data
//     getMiscellaneous: build.query<Miscellaneous[], string | void>({
//       query: (search) => ({
//         url: '/miscellaneous',
//         params: search ? { search } : {} // Optional search filter
//       }),
//       providesTags: ['Miscellaneous']
//     }),

//     // Fetch miscellaneous data by order ID
//     getMiscellaneousByOrderId: build.query<Miscellaneous, string>({
//       query: (order_id) => `/miscellaneous/${order_id}`,
//       providesTags: ['Miscellaneous']
//     }),

//     // Create a new miscellaneous record
//     createMiscellaneous: build.mutation<Miscellaneous, Omit<Miscellaneous, 'order_id'>>({
//       query: (newMiscellaneous) => ({
//         url: '/miscellaneous',
//         method: 'POST',
//         body: newMiscellaneous
//       }),
//       invalidatesTags: ['Miscellaneous']
//     }),

//     // Update an existing miscellaneous record
//     updateMiscellaneous: build.mutation<Miscellaneous, Pick<Miscellaneous, 'order_id'> & Partial<Miscellaneous>>({
//       query: ({ order_id, ...patch }) => ({
//         url: `/miscellaneous/${order_id}`,
//         method: 'PUT',
//         body: patch
//       }),
//       invalidatesTags: ['Miscellaneous']
//     }),

//     // Delete a miscellaneous record
//     deleteMiscellaneous: build.mutation<void, { order_id: string }>({
//       query: ({ order_id }) => ({
//         url: `/miscellaneous/${order_id}`,
//         method: 'DELETE'
//       }),
//       invalidatesTags: ['Miscellaneous']
//     })
//   }),
//   overrideExisting: true
// });

// // inventory
const ProductsInventoryApi = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // Fetch inventory items
    getInventoryItems: build.query<InventoryItemsApiResponse, void>({
      query: () => ({
        url: '/inventory'
      }),
      providesTags: ['InventoryItems']
    }),

    // Create a new inventory item
    createInventoryItem: build.mutation<InventoryItem, NewInventoryItemPayload>({
      query: (newInventoryItem) => ({
        url: '/inventory',
        method: 'POST',
        body: newInventoryItem
      }),
      invalidatesTags: ['InventoryItems']
    }),

    // Update an existing inventory item
    updateInventoryItem: build.mutation<InventoryItem, Pick<InventoryItem, 'inventoryId'>>({
      query: ({ inventoryId, ...patch }) => ({
        url: `/inventory/${inventoryId}`,
        method: 'PUT',
        body: patch
      }),
      invalidatesTags: ['InventoryItems']
    }),

    // fetch inventory insights

    getInventoryItemsInsight: build.query<InventoryItemsApiResponse, void>({
      query: () => ({
        url: '/sales/inventory/inventory-insights'
      }),
      providesTags: ['InventoryItemsInsight']
    }),

    // Endpoint to restock inventory
    // restockInventory: build.mutation<
    //   ApiResponse<Inventory>,
    //   { inventoryId: string; stock_quantity: number }
    // >({
    //   query: ({ inventoryId, stock_quantity }) => ({
    //     url: `/inventory/restock/${inventoryId}`,
    //     method: "PUT",
    //     body: { stock_quantity },
    //   }),
    //   // Tags for invalidating or updating the cache
    //   invalidatesTags: [{ type: "Inventory", id: "LIST" }],
    // }),

    // Delete an inventory item
    deleteInventoryItem: build.mutation<void, { inventory_item_id: string }>({
      query: ({ inventory_item_id }) => ({
        url: `/inventory-items/${inventory_item_id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['InventoryItems']
    }),

    restockInventoryItem: build.mutation<ApiResponse<InventoryRestock[]>, Pick<InventoryItem, 'inventoryId'>>({
      query: ({ inventoryId, ...data }) => ({
        url: `/inventory/restock/${inventoryId}`,
        method: 'PUT',
        body: data
      }),
      // Tags for invalidating or updating the cache
      invalidatesTags: ['InventoryItems'] // Invalidates inventory cache
    })
  }),
  overrideExisting: true
});

const ProductPricingApi = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // Fetch product pricing
    getProductPricing: build.query<ApiResponse<ProductPricing[]>, void>({
      query: () => ({
        url: '/product-pricing'
      }),
      providesTags: ['ProductPricing']
    }),

    // Create a new product pricing
    createProductPricing: build.mutation<ProductPricing, NewProductPricingPayload>({
      query: (newProductPricing) => ({
        url: '/product-pricing',
        method: 'POST',
        body: newProductPricing
      }),
      invalidatesTags: ['ProductPricing', 'InventoryItems']
    }),

    // Update an existing product pricing
    updateProductPricing: build.mutation<ProductPricing, Pick<ProductPricing, 'product_pricing_id'>>({
      query: ({ product_pricing_id, ...patch }) => ({
        url: `/product-pricing/${product_pricing_id}`,
        method: 'PUT',
        body: patch
      }),
      invalidatesTags: ['ProductPricing', 'InventoryItems']
    }),

    // Delete product pricing
    deleteProductPricing: build.mutation<void, { product_pricing_id: string }>({
      query: ({ product_pricing_id }) => ({
        url: `/product-pricing/${product_pricing_id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['ProductPricing', 'InventoryItems']
    })
  }),
  overrideExisting: true
});

// // import { InventoryApi } from './inventoryApi'; // assuming this is where you define your main API slice
// // import { Customer, NewCustomerPayload } from './types'; // assuming Customer type and payload types are defined

const CustomerApi = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // Fetch all customers
    getCustomers: build.query<NewCustomerPayload, void>({
      query: () => '/customers',
      providesTags: ['Customers']
    }),

    // Fetch a specific customer by ID
    // getCustomer: build.query<Customer, string | void>({
    //   query: (search) => ({
    //     url: `/customers/${search}`,
    //     params: search ? {search}: {},
    //   }),
    //   providesTags: ['Customers']
    // }),

    // Create a new customer
    createCustomer: build.mutation<NewCustomerPayload, Partial<Customer>>({
      query: (newCustomer) => ({
        url: '/customers',
        method: 'POST',
        body: newCustomer
      }),
      invalidatesTags: ['Customers', 'CustomerSales']
    }),

    // Update an existing customer
    updateCustomer: build.mutation<Customer, Pick<Customer, 'customerId'>>({
      query: ({ customerId, ...patch }) => ({
        url: `/customers/${customerId}`,
        method: 'PUT',
        body: patch
      }),
      invalidatesTags: ['Customers', 'CustomerSales']
    }),

    // Delete a customer
    deleteCustomer: build.mutation<void, Pick<Customer, 'customerId'>>({
      query: ({ customerId }) => ({
        url: `/customers/${customerId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Customers', 'CustomerSales']
    })
  }),
  overrideExisting: false
});

// // import { InventoryApi } from './inventoryApi'; // assuming this is where you define your main API slice
// // import { Transaction, NewTransactionPayload } from './types'; // assuming Transaction type and payload types are defined

const TransactionApi = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // Fetch all transactions
    getTransactions: build.query<ApiResponse<Transaction[]>, void>({
      query: () => '/transactions',
      providesTags: ['Transactions']
    }),

    // // Fetch transactions by customer ID
    // getTransactionsByCustomer: build.query<Transaction[], string>({
    //   query: (customerId) => `/transactions/customer/${customerId}`,
    //   providesTags: (result, error, customerId) => [{ type: 'Transactions', id: customerId }],
    // }),

    // // Fetch a specific transaction by ID
    // getTransaction: build.query<Transaction, string>({
    //   query: (transactionId) => `/transactions/${transactionId}`,
    //   providesTags: (result, error, transactionId) => [{ type: 'Transactions', id: transactionId }],
    // }),

    // Create a new transaction
    createTransaction: build.mutation<NewTransactionPayload, ProductItems>({
      query: (newTransaction) => ({
        url: '/transactions',
        method: 'POST',
        body: newTransaction
      }),
      invalidatesTags: ['Transactions', 'InventoryItems', 'TotalSales', 'CustomerSales', 'salesBetweenproductsdates']
    }),

    getTransactionsInsights: build.query<ApiResponse<TransactionProductsBetweenDates>, { startDate: string; endDate: string }>({
      query: ({ startDate, endDate }) => ({
        url: '/get-sales-products-between-dates',
        params: { startDate, endDate } // Send start and end date as query params
      }),
      providesTags: ['salesBetweenproductsdates'],
      keepUnusedDataFor: 300000
    })

    // Update an existing transaction
    // updateTransaction: build.mutation<Transaction, { transactionId: string; patch: Partial<Transaction> }>({
    //   query: ({ transactionId, patch }) => ({
    //     url: `/transactions/${transactionId}`,
    //     method: 'PUT',
    //     body: patch,
    //   }),
    //   invalidatesTags: ['Transactions'],
    // }),

    // Delete a transaction
    // deleteTransaction: build.mutation<void, { transactionId: string }>({
    //   query: ({ transactionId }) => ({
    //     url: `/transactions/${transactionId}`,
    //     method: 'DELETE',
    //   }),
    //   invalidatesTags: ['Transactions'],
    // }),
  }),
  overrideExisting: false
});

const SalesApi = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // getTotalSales: build.query<ApiResponse<SalesResponse>, void>({
    //   query: () => '/total-sales',
    //   providesTags: ['TotalSales'],
    //   keepUnusedDataFor: 300000 // Keep unused data for 5 minutes
    // }),

    // returns total cost of  sales between dates.
    // getSalesBetweenDates: build.query<ApiResponse<SalesResponse>, { startDate: string; endDate: string }>({
    //   query: ({ startDate, endDate }) => ({
    //     url: '/sales-between-dates',
    //     params: { startDate, endDate } // Send start and end date as query params
    //   }),
    //   providesTags: ['SalesByDateRange'],
    //   keepUnusedDataFor: 300000
    // }),

    // returns total cost of products between dates plus the respetive products
    // getSalesProductsBetweenDates: build.query<ApiResponse<TransactionProductsBetweenDates>, { startDate: string; endDate: string }>({
    //   query: ({ startDate, endDate }) => ({
    //     url: '/get-sales-products-between-dates',
    //     params: { startDate, endDate } // Send start and end date as query params
    //   }),
    //   providesTags: ['salesBetweenproductsdates'],
    //   keepUnusedDataFor: 300000
    // }),

    // getTotalSalesForProduct: build.query<ProductSalesResponse, string>({
    //   query: (productId) => `/sales/product/${productId}`, // Fetch total sales for a specific product
    //   providesTags: ["ProductSales"],
    //   keepUnusedDataFor: 300000,
    // }),

    // getTotalSalesForProductInRange: build.query<ProductSalesResponse, { productId: string; startDate: string; endDate: string }>({
    //   query: ({ productId, startDate, endDate }) => ({
    //     url: `/sales/product/${productId}/range`,
    //     params: { startDate, endDate },
    //   }),
    //   providesTags: ["ProductSalesByDateRange"],
    //   keepUnusedDataFor: 300000,
    // }),

    getTotalSalesForEachCustomer: build.query<ApiResponse<CustomerSalesResponse[]>, void>({
      query: () => '/sales-per-customer', // Fetch total sales for each customer
      providesTags: ['CustomerSales'],
      keepUnusedDataFor: 300000
    })

    // getTotalSalesForEachCustomerInRange: build.query<CustomerSalesResponse[], { startDate: string; endDate: string }>({
    //   query: ({ startDate, endDate }) => ({
    //     url: "/sales/customers/range",
    //     params: { startDate, endDate },
    //   }),
    //   providesTags: ["CustomerSalesByDateRange"],
    //   keepUnusedDataFor: 300000,
    // }),

    // getInventorySalesDifference: build.query<InventorySalesDifferenceResponse, string>({
    //   query: (date) => `/sales/inventory-difference?date=${date}`, // Fetch difference between stock and sales for a given date
    //   providesTags: ["InventorySalesDifference"],
    //   keepUnusedDataFor: 300000,
    // }),

    // calculateProfit: build.query<ProfitResponse, { startDate: string; endDate: string }>({
    //   query: ({ startDate, endDate }) => ({
    //     url: "/sales/profit",
    //     params: { startDate, endDate }, // Send date range for profit calculation
    //   }),
    //   providesTags: ["ProfitCalculation"],
    //   keepUnusedDataFor: 300000,
    // }),
  })
});

export const EmployeesApi = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // Fetch all employees
    getEmployees: build.query<ApiResponse<Employee[]>, void>({
      query: () => ({ url: '/employees' }),
      providesTags: ['Employees']
    }),

    // Fetch single employee
    getEmployeeById: build.query<ApiResponse<Employee[]>, string>({
      query: (id) => ({ url: `/employees/${id}` }),
      providesTags: (_result, _err, id) => [{ type: 'Employees', id }]
    }),

    // Create employee
    createEmployee: build.mutation<Employee, NewEmployeePayload>({
      query: (newEmployee) => ({
        url: '/employees',
        method: 'POST',
        body: newEmployee
      }),
      invalidatesTags: ['Employees']
    }),

    // Update employee
    updateEmployee: build.mutation<Employee, Pick<Employee, 'id'>>({
      query: ({ id, ...patch }) => ({
        url: `/employees/${id}`,
        method: 'PUT',
        body: patch
      }),
      invalidatesTags: ['Employees']
    }),

    // Delete employee
    deleteEmployee: build.mutation<void, string>({
      query: (id) => ({
        url: `/employees/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Employees']
    })
  })
});

export const AssetsApi = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // Fetch all assets
    getAssets: build.query<ApiResponse<Asset[]>, void>({
      query: () => ({ url: '/assets' }),
      providesTags: ['Assets']
    }),

    // Fetch single asset
    getAssetById: build.query<AssetsApiResponse, string>({
      query: (id) => ({ url: `/assets/${id}` }),
      providesTags: (_result, _err, id) => [{ type: 'Assets', id }]
    }),

    // Create asset
    createAsset: build.mutation<Asset, NewAssetPayload>({
      query: (newAsset) => ({
        url: '/assets',
        method: 'POST',
        body: newAsset
      }),
      invalidatesTags: ['Assets']
    }),

    // Update asset
    updateAsset: build.mutation<Asset, { id: string; data: Partial<NewAssetPayload> }>({
      query: ({ id, data }) => ({
        url: `/assets/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Assets']
    }),

    // Delete asset
    deleteAsset: build.mutation<void, string>({
      query: (id) => ({
        url: `/assets/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Assets']
    })
  })
});

export const { useGetAssetsQuery, useGetAssetByIdQuery, useCreateAssetMutation, useUpdateAssetMutation, useDeleteAssetMutation } =
  AssetsApi;

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation
} = EmployeesApi;

export const ExpensesApi = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // Fetch all expenses
    getExpenses: build.query<ExpensesApiResponse, void>({
      query: () => ({ url: '/expenses' }),
      providesTags: ['Expenses']
    }),

    // Fetch single expense
    getExpenseById: build.query<ExpensesApiResponse, string>({
      query: (id) => ({ url: `/expenses/${id}` }),
      providesTags: (_result, _err, id) => [{ type: 'Expenses', id }]
    }),

    // Create expense
    createExpense: build.mutation<Expense, NewExpensePayload>({
      query: (newExpense) => ({
        url: '/expenses',
        method: 'POST',
        body: newExpense
      }),
      invalidatesTags: ['Expenses']
    }),

    // Update expense
    updateExpense: build.mutation<Expense, { id: string; data: Partial<NewExpensePayload> }>({
      query: ({ id, data }) => ({
        url: `/expenses/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Expenses']
    }),

    // Delete expense
    deleteExpense: build.mutation<void, string>({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Expenses']
    })
  })
});

export const { useGetExpensesQuery, useGetExpenseByIdQuery, useCreateExpenseMutation, useUpdateExpenseMutation, useDeleteExpenseMutation } =
  ExpensesApi;

export const {
  // useGetTotalSalesQuery, // returns the total sales
  // useGetSalesBetweenDatesQuery, // returns total cost between dates query
  // useGetSalesProductsBetweenDatesQuery, // returns total cost between dates plus the products involved
  // useGetTotalSalesForProductQuery,
  // useGetTotalSalesForProductInRangeQuery,
  useGetTotalSalesForEachCustomerQuery
  // useGetTotalSalesForEachCustomerInRangeQuery,
  // useGetInventorySalesDifferenceQuery,
  // useCalculateProfitQuery,
} = SalesApi;

// src/features/reports/api/reportsApi.ts

// --- Types ---

export const ReportsApi = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // Profit & Loss Report
    getProfitAndLoss: build.query<ApiResponse<ProfitAndLossResponse>, { startDate: string; endDate: string }>({
      query: ({ startDate, endDate }) => ({
        url: `/reports/profit-loss?startDate=${startDate}&endDate=${endDate}`,
        params: { startDate, endDate }
      }),
      providesTags: ['Reports']
    }),

    // Balance Sheet Report
    getBalanceSheet: build.query<ApiResponse<BalanceSheetResponse>, { asOfDate: string }>({
      query: ({ asOfDate }) => ({
        url: '/reports/balance-sheet',
        params: { asOfDate }
      }),
      providesTags: ['Reports']
    }),

    // Cashflow Statement
    getCashflow: build.query<ApiResponse<CashflowStatement>, { startDate: string; endDate: string }>({
      query: ({ startDate, endDate }) => ({
        url: `/reports/cashflow?startDate=${startDate}&endDate=${endDate}`,
        params: { startDate, endDate }
      }),
      providesTags: ['Reports']
    })
  }),
  overrideExisting: false
});

// product purchase stock.
export const StockApi = InventoryApi.injectEndpoints({
  endpoints: (build) => ({
    // Fetch Low Stock
    fetchLowStock: build.query<ApiResponse<LowStockResponseItem[]>, void>({
      query: () => ({
        url: '/inventory/low-stock',
        method: 'GET'
      }),
      providesTags: ['Stock']
    }),

    // Fetch Low Stock
    fetchStock: build.query<ApiResponse<StockResponseItem[]>, void>({
      query: () => ({
        url: '/inventory/stock',
        method: 'GET'
      }),
      providesTags: ['Stock']
    }),

    // Update Stock Level
    updateStockLevel: build.mutation<LowStockResponseItem, { supplier_products_id: string; reorder_level: number }>({
      query: (body) => ({
        url: '/inventory/update-stock-level',
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Stock']
    })
  }),
  overrideExisting: false
});

// Export hooks
export const { useFetchLowStockQuery, useUpdateStockLevelMutation, useFetchStockQuery } = StockApi;

export const { useGetProfitAndLossQuery, useGetBalanceSheetQuery, useGetCashflowQuery } = ReportsApi;

export const {
  useGetTransactionsQuery,
  // useGetTransactionsByCustomerQuery,
  // useGetTransactionQuery,
  useCreateTransactionMutation,
  useGetTransactionsInsightsQuery
  // useUpdateTransactionMutation,
  // useDeleteTransactionMutation,
} = TransactionApi;

export const { useStartPosSessionMutation, useCheckPosSessionQuery, useClosePosSessionMutation } = PosSessionAPI;

export const {
  useGetCustomersQuery,
  // useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation
} = CustomerApi;

// // Export hooks to be used in components
export const {
  useGetProductPricingQuery,
  useCreateProductPricingMutation,
  useUpdateProductPricingMutation,
  useDeleteProductPricingMutation
} = ProductPricingApi;

export const {
  useGetInventoryItemsQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
  useRestockInventoryItemMutation,
  useGetInventoryItemsInsightQuery
} = ProductsInventoryApi;

export const { useGetCashBookRecordsQuery } = CashBookInventoryAPI;

export const { useLoginMutation, useGetCurrentUserQuery, useLazyLogoutQuery } = AuthAPI;

// export const {
//   useGetMiscellaneousQuery,
//   useGetMiscellaneousByOrderIdQuery,
//   useCreateMiscellaneousMutation,
//   useUpdateMiscellaneousMutation,
//   useDeleteMiscellaneousMutation
// } = MiscellaneousApi;

// export const {
//   useGetOrderProductsQuery,
//   useGetOrderProductByIdQuery,
//   useCreateOrderProductMutation,
//   useUpdateOrderProductMutation,
//   useDeleteOrderProductMutation,
//   useGetOrderProductByOrderIdQuery
// } = OrderProductApi;

export const {
  useGetAccountsQuery,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  useCreateAccountMutation,
  useGetAccountsTrialBalanceQuery
} = AccountsAPI;

export const {
  // Generated hooks for supplier products
  useGetSupplierProductsQuery,
  useCreateSupplierProductMutation,
  useUpdateSupplierProductMutation,
  useDeleteSupplierProductMutation
} = SupplierProductApi;

// export const { useGetOrdersQuery, useCreateOrderMutation, useDeleteOrderMutation, useGetOrderByIdQuery, useUpdateOrderMutation } = OrderApi;

export const {
  useGetPurchaseBatchPayablesQuery,
  useCreatePurchaseBatchPayableMutation
  // useUpdatePurchaseBatchPayableMutation,
  // useDeletePurchaseBatchPayableMutation
} = PurchaseBatchPayablesApi;

export const {
  // Generated hooks for supplier pricing
  useGetSupplierPricingQuery,
  useCreateSupplierPricingMutation,
  useUpdateSupplierPricingMutation,
  useDeleteSupplierPricingMutation
} = SupplierPricingApi;

export const {
  // Generated hooks for suppliers
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation
} = SupplierApi;

export const {
  // Generated hooks for units
  useGetUnitsQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation
} = UnitApi;

export const { useGetProductsQuery, useUpdateProductMutation, useDeleteProductMutation, useCreateProductMutation } = ProductsApi;

export const {
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
  useCreateCategoryMutation,
  useGetSubCategoriesQuery,
  useGetSubCategoryByIdQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useDeleteCategoryMutation
} = CategoryApi;

export const {
  useGetBatchInventoriesQuery
  // useGetBatchInventoryByIdQuery,
  // useCreateBatchInventoryMutation,
  // useUpdateBatchInventoryMutation,
  // useDeleteBatchInventoryMutation
} = BatchInventoriesApi;

export const {
  useGetPurchasesQuery,
  // useGetPurchaseByIdQuery,
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation
} = PurchaseApi;

// // export const {
// // //   useGetDashboardMetricsQuery
// //   // useGetProductsQuery,
// //   // useCreateProductMutation,
// //   // useGetUsersQuery,
// //   // useGetExpensesByCategoryQuery,
// //   // useGetCategoriesQuery,
// //   // useGetSubCategoriesQuery,
// //   // useGetSubCategoryByIdQuery,
// //   // useCreateSubCategoryMutation,
// //   // useUpdateSubCategoryMutation,
// //   // useDeleteSubCategoryMutation,
// //   // useUpdateProductMutation,
// //   //  useDeleteProductMutation
// // } = InventoryApi;

// export const {
//   // Generated hooks for units
//   useGetUnitsQuery
//   //   useCreateUnitMutation,
//   //   useUpdateUnitMutation,
//   //   useDeleteUnitMutation
// } = UnitApi;
