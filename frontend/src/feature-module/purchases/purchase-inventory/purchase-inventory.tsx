import PrimeDataTable from '@components/data-table';
// import SearchFromApi from '@components/data-table/search';
import DeleteModal from '@components/delete-modal';
import { useState } from 'react';
import { Link } from 'react-router';
import TableTopHead from '@components/table-top-head';
import CommonFooter from '@components/footer/commonFooter';
import { useGetBatchInventoriesQuery } from '@core/redux/api/inventory-api';

const BatchInventory = () => {
  const { data: batchData, isLoading } = useGetBatchInventoriesQuery();
  const data = batchData?.data || [];
  console.log('Batch inventory data:', data);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rows, setRows] = useState<number>(10);
  // const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

  const columns = [
    {
      header: (
        <label className="checkboxs">
          <input type="checkbox" id="select-all" />
          <span className="checkmarks" />
        </label>
      ),
      body: () => (
        <label className="checkboxs">
          <input type="checkbox" />
          <span className="checkmarks" />
        </label>
      ),
      sortable: false
    },
    { header: 'Batch', field: 'batch', key: 'batch' },
    { header: 'Product', field: 'productName', key: 'productName' },
    { header: 'Supplier', field: 'supplierName', key: 'supplierName' },
    { header: 'Total Units', field: 'totalUnits', key: 'totalUnits' },
    { header: 'Damaged Units', field: 'damaged_units', key: 'damaged_units' },
    { header: 'Payment Status', field: 'payment_status', key: 'payment_status' },
    { header: 'Status', field: 'status', key: 'status' },
    { header: 'Created At', field: 'createdAt', key: 'createdAt' }
    // {
    //   header: 'Actions',
    //   field: 'actions',
    //   key: 'actions',
    //   sortable: false,
    //   body: (_row: any) => (
    //     <div className="d-flex align-items-center edit-delete-action">
    //       <Link className="me-2 border rounded d-flex align-items-center p-2" to="#" data-bs-toggle="modal" data-bs-target="#edit-batch">
    //         <i className="feather icon-edit" />
    //       </Link>
    //       <Link className="p-2 border rounded d-flex align-items-center" to="#" data-bs-toggle="modal" data-bs-target="#delete-modal">
    //         <i className="feather icon-trash-2" />
    //       </Link>
    //     </div>
    //   )
    // }
  ];

  // const handleSearch = (value: any) => {
  //   setSearchQuery(value);
  // };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Batch Inventory</h4>
                <h6>Manage your batch inventory</h6>
              </div>
            </div>
            <TableTopHead />
            <div className="page-btn">
              <Link to="#" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-batch">
                <i className="ti ti-circle-plus me-1" />
                Add Batch
              </Link>
            </div>
          </div>
          {/* /Batch Inventory list */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              {/* <SearchFromApi callback={handleSearch} rows={rows} setRows={setRows} /> */}
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                {isLoading ? (
                  <p>loading....</p>
                ) : (
                  <PrimeDataTable
                    column={columns}
                    data={data || []}
                    rows={rows}
                    setRows={setRows}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalRecords={data?.length || 0}
                  />
                )}
              </div>
            </div>
          </div>
          {/* /Batch Inventory list */}
        </div>
        <CommonFooter />
      </div>

      {/* Add Batch Modal */}
      <div className="modal fade" id="add-batch">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div className="page-title">
                <h4>Add Batch</h4>
              </div>
              <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form>
              <div className="modal-body">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">Batch Name</label>
                      <input type="text" className="form-control" placeholder="Enter batch name" />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">Product</label>
                      <input type="text" className="form-control" placeholder="Enter product name" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary me-2" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Batch Modal */}
      <div className="modal fade" id="edit-batch">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div className="page-title">
                <h4>Edit Batch</h4>
              </div>
              <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form>
              <div className="modal-body">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">Batch Name</label>
                      <input type="text" className="form-control" defaultValue="BATCH-2026-7" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary me-2" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <DeleteModal />
    </>
  );
};

export default BatchInventory;

// import PrimeDataTable from '@components/data-table';
// import SearchFromApi from '@components/data-table/search';
// import DeleteModal from '@components/delete-modal';
// import { useState } from 'react';
// import { Link } from 'react-router';
// import { stockData } from '@core/json/stock-data';
// import TableTopHead from '@components/table-top-head';
// import { stockImg02 } from '@utils/imagepath';
// import CommonSelect from '@components/select/common-select';
// import CommonFooter from '@components/footer/commonFooter';
// import { useGetBatchInventoriesQuery } from '@core/redux/api/inventory-api';

// const ManageStock = () => {
//   const { data } = useGetBatchInventoriesQuery();
//   console.log('data is ', data);
//   /**
//    *  {
//             "batchInventory": "4ef7ab2a-e7ef-420e-b048-4d51fd2bc87c",
//             "purchaseId": "07abe35e-361c-40f2-a046-acc9ee80e1f9",
//             "totalUnits": -80,
//             "status": "ACTIVE",
//             "createdAt": "2025-08-20T20:35:48.408Z",
//             "batch": "BATCH-2026-7",
//             "damaged_units": 20,
//             "supplierName": "FarmFeed Suppliers",
//             "payment_status": "unpaid",
//             "productName": "Premium Cattle Feed"
//         },
//         {
//             "batchInventory": "77700f37-8248-4514-b37b-c66b2fd40aa6",
//             "purchaseId": "ddd4222c-415c-486a-a1b0-0a46852e69a9",
//             "totalUnits": -210,
//             "status": "ACTIVE",
//             "createdAt": "2025-08-21T06:03:19.965Z",
//             "batch": "BATCH-2026-09-20",
//             "damaged_units": 10,
//             "supplierName": "AnimalNutra Co.",
//             "payment_status": "paid",
//             "productName": "Dog Food - Adult Formula"
//         }
//    */

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
