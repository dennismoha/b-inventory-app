'use client';
import { useState } from 'react';
import { BarChart, PieChart, LineChart } from '@mui/x-charts';
import { useGetTotalSalesForEachCustomerQuery } from '@core/redux/api/inventory-api';
import type { CustomerTotalSalesInterface, GetTransactionDateData } from '../interface/features-interface';
// import { CustomerTotalSalesInterface, GetTransactionDateData } from '../interface/customer-interface';

const CustomerCard = () => {
  // Sample customer data (multiple customers)
  const { data, isLoading, isError } = useGetTotalSalesForEachCustomerQuery();
  console.log('data from backend is ', data);

  const customers = data?.data ? data.data : [];

  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null); // Track which customer is expanded
  const [expandedTransactions, setExpandedTransactions] = useState<string | null>(null); // Track which customer's transactions are expanded

  const toggleCustomerDetails = (customerId: string | null) => {
    setExpandedCustomerId((prev) => (prev === customerId ? null : customerId));
  };

  const toggleTransactions = (customerId: string | null) => {
    setExpandedTransactions((prev) => (prev === customerId ? null : customerId));
  };

  // Function to calculate total sales
  const calculateTotalSales = (sales: CustomerTotalSalesInterface[]) => {
    return sales.reduce((total, sale) => total + sale.totalSales, 0);
  };

  // Function to calculate transaction total (sum of productTotalCost, VAT, and discount)
  //   const calculateTransactionTotal = (transaction) => {
  //     return transaction.TransactionProduct.reduce((total, product) => {
  //       const productTotal = product.productTotalCost * product.quantity;
  //       const vatAmount = product.VAT;
  //       const discountAmount = product.discount;
  //       return total + productTotal + vatAmount - discountAmount;
  //     }, 0);
  //   };

  //  data processing functions for the charts
  const getTransactionDateData = (transactions: GetTransactionDateData[]) => {
    return transactions.map((transaction) => ({
      date: new Date(transaction.transactionDateCreated!).toLocaleDateString(),
      total: transaction.totalCost
    }));
  };

  const getProductDistributionData = (transactions: GetTransactionDateData[]) => {
    const productCounts: Record<string, number> = {};
    transactions.forEach((transaction) => {
      transaction.Sales?.forEach((product) => {
        productCounts[product.productName] = (productCounts[product.productName] || 0) + product.quantity;
      });
    });

    console.log('product counts are ', productCounts);

    return Object.keys(productCounts).map((product) => ({
      label: product,
      value: productCounts[product]
    }));
  };

  const getTransactionTrendData = (transactions: GetTransactionDateData[]) => {
    return transactions.map((transaction) => ({
      date: new Date(transaction.transactionDateCreated!).toLocaleDateString(),
      total: transaction.totalCost
    }));
  };

  if (isLoading) {
    return <p> fetching data ...</p>;
  }

  if (isError) {
    return <p> error fetching data.....</p>;
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="p-8">
          {customers.length === 0 ? (
            '<p>no customers </p>'
          ) : (
            <>
              {customers.map((customer) => (
                <div
                  key={customer.customerId}
                  className="bg-white rounded-lg shadow-lg mb-8 p-6 flex flex-col space-y-4"
                  style={{
                    display: expandedCustomerId === customer.customerId || expandedCustomerId === null ? 'block' : 'none'
                  }}
                >
                  {/* Customer Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {customer.firstName} {customer.lastName}
                      </h2>
                      <p className="text-sm text-gray-500">Customer ID: {customer.customerId}</p>
                    </div>
                    <div>
                      <button
                        className="bg-blue-500 text-white py-1 px-4 rounded-full"
                        onClick={() => toggleCustomerDetails(customer.customerId)}
                      >
                        {expandedCustomerId === customer.customerId ? 'Hide Details' : 'Show Details'}
                      </button>
                    </div>
                  </div>

                  {/* Customer Details */}
                  {expandedCustomerId === customer.customerId && (
                    <>
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold">Customer Details</h3>
                        <p>
                          <strong>Full Name:</strong> {customer.firstName} {customer.lastName}
                        </p>
                        <p>
                          <strong>Customer ID:</strong> {customer.customerId}
                        </p>
                      </div>

                      {/* Total Sales Overview */}
                      <div className="border-t pt-4">
                        <h3 className="text-xl font-semibold">Total Sales Overview</h3>
                        <ul className="space-y-2 mt-2">
                          {customer.totalSales.map((sale, index) => (
                            <li key={index} className="flex justify-between">
                              <span className="text-gray-700">{sale.products}</span>
                              <span className="font-semibold">{sale.totalSales.toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                        {/* Show Total Sales Sum */}
                        <div className="flex justify-between mt-4 font-bold">
                          <span>Total Sales Sum:</span>
                          <span>{calculateTotalSales(customer.totalSales).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Collapsible Transaction History */}
                      <div className="border-t pt-4">
                        <h3 className="text-xl font-semibold flex justify-between items-center">
                          <span>Transaction History</span>
                          <button className="text-blue-500" onClick={() => toggleTransactions(customer.customerId)}>
                            {expandedTransactions === customer.customerId ? 'Hide Transactions' : 'Show Transactions'}
                          </button>
                        </h3>

                        {expandedTransactions === customer.customerId && (
                          <>
                            {customer.transactionDate.map((transaction) => (
                              <div key={transaction.transactionId}>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-700">{new Date(transaction.transactionDateCreated!).toLocaleString()}</span>
                                  <span className="text-sm text-gray-500">Payment: {transaction.paymentMethod}</span>
                                </div>
                                <div className="mt-2 pl-4">
                                  <table className="min-w-full table-auto border-collapse">
                                    <thead>
                                      <tr>
                                        <th className="border px-4 py-2">Product</th>
                                        <th className="border px-4 py-2">Price</th>
                                        <th className="border px-4 py-2">Quantity</th>
                                        <th className="border px-4 py-2">VAT</th>
                                        <th className="border px-4 py-2">Discount</th>
                                        <th className="border px-4 py-2">Subtotal</th>
                                        <th className="border px-4 py-2">Total Cost</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {transaction.Sales?.map((product, idx) => (
                                        <tr key={idx}>
                                          <td className="border px-4 py-2">{product.productName}</td>
                                          <td className="border px-4 py-2">{product.price.toFixed(2)}</td>
                                          <td className="border px-4 py-2">{product.quantity}</td>
                                          <td className="border px-4 py-2">{product.VAT}</td>
                                          <td className="border px-4 py-2">{product.discount} %</td>
                                          <td className="border px-4 py-2">{product.productSubTotalCost!.toFixed(2)}</td>
                                          <td className="border px-4 py-2">{product.productTotalCost!.toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  {/* Show Transaction Total Cost */}
                                  <div className="flex justify-between mt-4 font-bold">
                                    <span>Transaction Total:</span>
                                    <span>{transaction.totalCost}</span>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Charts */}
                            <div className="mt-4">
                              <h4>Transactions Over Time. Day the highest transactions were made</h4>
                              <BarChart
                                series={[
                                  {
                                    data: getTransactionDateData(customer.transactionDate).map((item) => item.total)
                                  }
                                ]}
                                xAxis={[
                                  {
                                    data: getTransactionDateData(customer.transactionDate).map((item) => item.date),
                                    scaleType: 'band'
                                  }
                                ]}
                                height={290}
                                // margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                              />
                            </div>

                            <div className="mt-4">
                              <h4>Product Distribution with resepct to the quantity of item sold the most</h4>
                              <PieChart
                                series={[
                                  {
                                    data: getProductDistributionData(customer.transactionDate)
                                  }
                                ]}
                                width={400}
                                height={200}
                              />
                            </div>

                            <div className="mt-4">
                              <h4>Transaction Trend with the days he made the highest to the lowest transaction</h4>

                              <LineChart
                                xAxis={[
                                  {
                                    data: getTransactionTrendData(customer.transactionDate).map(
                                      (item) => new Date(item.date) // Convert date string to timestamp
                                    ),
                                    scaleType: 'time' // Ensuring it's time-based for proper date rendering
                                  }
                                ]}
                                series={[{ data: getTransactionTrendData(customer.transactionDate).map((item) => item.total) }]}
                                height={590}
                                width={590}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;

// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { customerreportdata } from "../../core/json/customerreportdata";
// import { all_routes } from "../../routes/all_routes";
// import RefreshIcon from "../../components/tooltip-content/refresh";
// import CollapesIcon from "../../components/tooltip-content/collapes";
// import TooltipIcons from "../../components/tooltip-content/tooltipIcons";
// import PrimeDataTable from "../../components/data-table";
// import CommonSelect from "../../components/select/common-select";
// import CommonDateRangePicker from "../../components/date-range-picker/common-date-range-picker";

// const CustomerReport = () => {
//   const data = customerreportdata;
//   const [listData, _setListData] = useState<any[]>(data);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [totalRecords, _setTotalRecords] = useState<any>(5);
//   const [rows, setRows] = useState<number>(10);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
//   const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(null);

//   const route = all_routes;

//   const columns = [
//     {
//       header: "Reference",
//       field: "Reference",
//       body: (text: any) => (
//         <Link to="#" className="text-orange">
//           {text.Reference}
//         </Link>
//       ),
//       sorter: (a: any, b: any) => a.Reference.length - b.Reference.length,
//     },
//     {
//       header: "Code",
//       field: "Code",
//       sorter: (a: any, b: any) => a.Code.length - b.Code.length,
//     },

//     {
//       header: "Customer",
//       field: "Customer",
//       body: (text: any) => (
//         <>
//           <div className="d-flex align-items-center">
//             <Link to="#" className="avatar avatar-md">
//               <img src={text.image} className="img-fluid" alt="img" />
//             </Link>
//             <div className="ms-2">
//               <p className="text-dark mb-0">
//                 <Link to="#">{text.Customer}</Link>
//               </p>
//             </div>
//           </div>
//         </>
//       ),
//       sorter: (a: any, b: any) => a.Customer.length - b.Customer.length,
//     },

//     {
//       header: "Total Orders",
//       field: "Total_Orders",
//       sorter: (a: any, b: any) => a.Total_Orders.length - b.Total_Orders.length,
//     },
//     {
//       header: "Amount",
//       field: "Amount",
//       sorter: (a: any, b: any) => a.Amount.length - b.Amount.length,
//     },

//     {
//       header: "Payment Method",
//       field: "Payment_Method",
//       sorter: (a: any, b: any) =>
//         a.Payment_Method.length - b.Payment_Method.length,
//     },
//     {
//       header: "Status",
//       field: "Status",
//       body: (text: any) => (
//         <span
//           className={`badge ${text === "Completed" ? "badge-success" : "badge-danger"} d-inline-flex align-items-center badge-xs`}
//         >
//           {text.Status}
//         </span>
//       ),
//       sorter: (a: any, b: any) => a.Status.length - b.Status.length,
//     },
//   ];

//   const Customer = [
//     { value: "All", label: "All" },
//     { value: "Carl Evans", label: "Carl Evans" },
//     { value: "Minerva Rameriz", label: "Minerva Rameriz" },
//     { value: "Robert Lamon", label: "Robert Lamon" },
//   ];
//   const PaymentMethod = [
//     { value: "All", label: "All" },
//     { value: "Cash", label: "Cash" },
//     { value: "Paypal", label: "Paypal" },
//     { value: "Stripe", label: "Stripe" },
//   ];
//   const PaymentStatus = [
//     { value: "All", label: "All" },
//     { value: "Completed", label: "Completed" },
//     { value: "Unpaid", label: "Unpaid" },
//     { value: "Paid", label: "Paid" },
//   ];

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="table-tab">
//           <ul className="nav nav-pills">
//             <li className="nav-item">
//               <Link className="nav-link active" to={route.customerreport}>
//                 Customer Report
//               </Link>
//             </li>
//             <li className="nav-item">
//               <Link className="nav-link" to={route.customerduereport}>
//                 Customer Due
//               </Link>
//             </li>
//           </ul>
//         </div>
//         <div>
//           <div className="page-header">
//             <div className="add-item d-flex">
//               <div className="page-title">
//                 <h4>Customer Report</h4>
//                 <h6>View Reports of Customer</h6>
//               </div>
//             </div>
//             <ul className="table-top-head">
//               <RefreshIcon />
//               <CollapesIcon />
//             </ul>
//           </div>
//           <div className="card border-0">
//             <div className="card-body pb-1">
//               <form>
//                 <div className="row align-items-end">
//                   <div className="col-lg-10">
//                     <div className="row">
//                       <div className="col-md-3">
//                         <div className="mb-3">
//                           <label className="form-label">Choose Date</label>
//                           <div className="input-icon-start position-relative">
//                             <CommonDateRangePicker />
//                             <span className="input-icon-left">
//                               <i className="ti ti-calendar" />
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="col-md-3">
//                         <div className="mb-3">
//                           <label className="form-label">Customer</label>
//                           <CommonSelect
//                             className="w-100"
//                             options={Customer}
//                             value={selectedCustomer}
//                             onChange={(e) => setSelectedCustomer(e.value)}
//                             placeholder="Choose"
//                             filter={false}
//                           />
//                         </div>
//                       </div>
//                       <div className="col-md-3">
//                         <div className="mb-3">
//                           <label className="form-label">Payment Method</label>
//                           <CommonSelect
//                             className="w-100"
//                             options={PaymentMethod}
//                             value={selectedPaymentMethod}
//                             onChange={(e) => setSelectedPaymentMethod(e.value)}
//                             placeholder="Choose"
//                             filter={false}
//                           />
//                         </div>
//                       </div>
//                       <div className="col-md-3">
//                         <div className="mb-3">
//                           <label className="form-label">Payment Status</label>
//                           <CommonSelect
//                             className="w-100"
//                             options={PaymentStatus}
//                             value={selectedPaymentStatus}
//                             onChange={(e) => setSelectedPaymentStatus(e.value)}
//                             placeholder="Choose"
//                             filter={false}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-lg-2">
//                     <div className="mb-3">
//                       <button className="btn btn-primary w-100" type="submit">
//                         Generate Report
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </div>
//           {/* /product list */}
//           <div className="card table-list-card no-search">
//             <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
//               <div>
//                 <h4>Customer Report</h4>
//               </div>
//               <ul className="table-top-head">
//                 <TooltipIcons />
//                 <li>
//                   <Link to="#"
//                     data-bs-toggle="tooltip"
//                     data-bs-placement="top"
//                     title="Print"
//                   >
//                     <i className="ti ti-printer" />
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//             <div className="card-body">
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
//       </div>
//       <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
//         <p className="mb-0">2014-2025 © DreamsPOS. All Right Reserved</p>
//         <p>
//           Designed &amp; Developed By{" "}
//           <Link to="#" className="text-orange">
//             Dreams
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default CustomerReport;
