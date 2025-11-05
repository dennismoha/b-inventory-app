import { useMemo, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement // Registering the ArcElement for Pie charts
);

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Register chart.js elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

import 'react-datepicker/dist/react-datepicker.css';
import { useGetTransactionsInsightsQuery } from '@core/redux/api/inventory-api';
import type { Transaction } from '@/feature-module/interface/features-interface';

// import { Transaction } from '../interfaces/transactions-interface';

// Helper Functions
const groupByDate = (transactions: Transaction[]) => {
  return transactions.reduce((acc: { [key: string]: number }, transaction) => {
    const date = new Date(transaction.transactionDateCreated).toLocaleDateString();
    acc[date] = acc[date] ? acc[date] + transaction.totalCost : transaction.totalCost;
    return acc;
  }, {});
};

const getSupplierSalesData = (transactions: Transaction[]) => {
  const supplierSales: { [key: string]: number } = {};
  transactions.forEach((transaction) => {
    transaction.Sales.forEach((product) => {
      const supplier = product.supplierProduct!.supplier!.name;
      if (supplierSales[supplier]) {
        supplierSales[supplier] += product.productTotalCost!;
      } else {
        supplierSales[supplier] = product.productTotalCost!;
      }
    });
  });
  return supplierSales;
};

const getPaymentMethodData = (transactions: Transaction[]) => {
  const paymentMethods = transactions.reduce((acc: { [key: string]: number }, transaction) => {
    const paymentMethod = transaction.paymentMethod;
    acc[paymentMethod] = acc[paymentMethod] ? acc[paymentMethod] + transaction.totalCost : transaction.totalCost;
    return acc;
  }, {});
  return paymentMethods;
};

//   const getProductSalesData = (transactions) => {
//     const productSales = {};
//     transactions.forEach((transaction) => {
//       transaction.Sales.forEach((product) => {
//         const productName = product.productName;
//         if (productSales[productName]) {
//           productSales[productName] += product.productTotalCost;
//         } else {
//           productSales[productName] = product.productTotalCost;
//         }
//       });
//     });
//     return productSales;
//   };

// Function to filter transactions based on date range
const filterTransactionsByDate = (transactions: Transaction[], startDate: Date, endDate: Date) => {
  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.transactionDateCreated);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
};

const getSupplierSalesByCustomer = (transactions: Transaction[]) => {
  const customerSupplierSales: { [key: string]: { [key: string]: number } } = {};

  transactions.forEach((transaction) => {
    const customerId = `${transaction.customer!.firstName} ${transaction.customer!.lastName}`;

    transaction.Sales.forEach((product) => {
      const supplierName = product.supplierProduct!.supplier!.name;

      if (!customerSupplierSales[customerId]) {
        customerSupplierSales[customerId] = {};
      }

      if (customerSupplierSales[customerId][supplierName]) {
        customerSupplierSales[customerId][supplierName] += product.productTotalCost!;
      } else {
        customerSupplierSales[customerId][supplierName] = product.productTotalCost!;
      }
    });
  });

  return customerSupplierSales;
};

// Function to calculate customer spending data
const getCustomerSpendingData = (transactions: Transaction[]) => {
  return transactions.map((transaction) => ({
    customerName: `${transaction.customer!.firstName} ${transaction.customer!.lastName}`,
    totalSpent: transaction.totalCost
  }));
};

// Function to calculate product sales data
const getProductSalesData = (transactions: Transaction[]) => {
  const productSales: { [key: string]: number } = {};
  transactions.forEach((transaction) => {
    transaction.Sales.forEach((product) => {
      if (productSales[product.productName]) {
        productSales[product.productName] += product.quantity;
      } else {
        productSales[product.productName] = product.quantity;
      }
    });
  });
  return Object.keys(productSales).map((productName) => ({
    productName,
    totalSales: productSales[productName]
  }));
};

// Function to get sorted transactions (from highest to lowest)
const getSortedTransactions = (transactions: Transaction[]) => {
  return transactions.sort((a, b) => b.totalCost - a.totalCost);
};

// Function to sum transactions per day
const sumTransactionsPerDay = (transactions: Transaction[]) => {
  const dailyTotal = transactions.reduce((acc: { [key: string]: number }, transaction) => {
    const date = new Date(transaction.transactionDateCreated).toLocaleDateString(); // Get date only (ignore time)
    if (acc[date]) {
      acc[date] += transaction.totalCost;
    } else {
      acc[date] = transaction.totalCost;
    }
    return acc;
  }, {});

  return Object.keys(dailyTotal).map((date) => ({
    date,
    total: dailyTotal[date]
  }));
};

// Function to count the number of transactions per day
const countTransactionsPerDay = (transactions: Transaction[]) => {
  const dailyCount = transactions.reduce((acc: { [key: string]: number }, transaction) => {
    const date = new Date(transaction.transactionDateCreated).toLocaleDateString(); // Get date only (ignore time)
    if (acc[date]) {
      acc[date] += 1;
    } else {
      acc[date] = 1;
    }
    return acc;
  }, {});

  return Object.keys(dailyCount).map((date) => ({
    date,
    count: dailyCount[date]
  }));
};

// Function to count supplier appearances in transactions
const countSupplierAppearances = (transactions: Transaction[]) => {
  const supplierCount = transactions.reduce((acc: { [key: string]: number }, transaction) => {
    transaction.Sales.forEach((product) => {
      const supplierName = product?.supplierProduct!.supplier!.name;
      if (acc[supplierName]) {
        acc[supplierName] += 1;
      } else {
        acc[supplierName] = 1;
      }
    });
    return acc;
  }, {});

  return Object.keys(supplierCount).map((supplier) => ({
    supplier,
    count: supplierCount[supplier]
  }));
};

// Function to count supplier products and summarize their sales
const countSupplierProductSales = (transactions: Transaction[]) => {
  const supplierSales = transactions.reduce((acc: { [key: string]: { supplierName: string; totalQuantity: number } }, transaction) => {
    transaction.Sales!.forEach((product) => {
      const supplierId = product?.supplierProduct!.supplier!.supplier_id;
      // const productName = product.productName;
      const quantity = product.quantity;

      if (!acc[supplierId]) {
        acc[supplierId] = { supplierName: product.supplierProduct!.supplier!.name, totalQuantity: 0 };
      }

      acc[supplierId].totalQuantity += quantity;
    });
    return acc;
  }, {});

  return Object.keys(supplierSales).map((supplierId) => ({
    supplierName: supplierSales[supplierId].supplierName,
    totalQuantity: supplierSales[supplierId].totalQuantity
  }));
};

// Helper Function to get the Customer who bought the most products from a Supplier
const getTopCustomerPerSupplier = (transactions: Transaction[]) => {
  const supplierCustomerQuantity: { [key: string]: { [key: string]: number } } = {};

  transactions.forEach((transaction) => {
    transaction.Sales?.forEach((product) => {
      const supplierName: string = product.supplierProduct!.supplier!.name;
      const customerName = `${transaction.customer!.firstName} ${transaction.customer!.lastName}`;
      const productQuantity = product.quantity;

      // Initialize supplier if not already in the object
      if (!supplierCustomerQuantity[supplierName]) {
        supplierCustomerQuantity[supplierName] = {};
      }

      // Add product quantity for the customer
      if (supplierCustomerQuantity[supplierName][customerName]) {
        supplierCustomerQuantity[supplierName][customerName] += productQuantity;
      } else {
        supplierCustomerQuantity[supplierName][customerName] = productQuantity;
      }
    });
  });

  // Find the customer with the most quantity per supplier
  const topCustomerPerSupplier: { [key: string]: { customer: string; quantity: number } } = {};
  for (const supplier in supplierCustomerQuantity) {
    let maxQuantity = 0;
    let topCustomer = '';

    for (const customer in supplierCustomerQuantity[supplier]) {
      if (supplierCustomerQuantity[supplier][customer] > maxQuantity) {
        maxQuantity = supplierCustomerQuantity[supplier][customer];
        topCustomer = customer;
      }
    }

    topCustomerPerSupplier[supplier] = {
      customer: topCustomer,
      quantity: maxQuantity
    };
  }

  return topCustomerPerSupplier;
};

type prods = {
  productName: string;
  quantity: number;
};

const getSupplierWithMostProductsForCustomer = (transactions: Transaction[]) => {
  const customerSupplierQuantity: { [key: string]: { [key: string]: { totalQuantity: number; products: prods[] } } } = {};

  transactions.forEach((transaction) => {
    const customerName = `${transaction.customer!.firstName} ${transaction.customer!.lastName}`;
    transaction.Sales.forEach((product) => {
      const supplierName = product.supplierProduct!.supplier!.name;
      const quantity = product.quantity;

      // Initialize the customer in the object if not already present
      if (!customerSupplierQuantity[customerName]) {
        customerSupplierQuantity[customerName] = {};
      }

      // Initialize the supplier for that customer
      if (!customerSupplierQuantity[customerName][supplierName]) {
        customerSupplierQuantity[customerName][supplierName] = {
          totalQuantity: 0,
          products: []
        };
      }

      // Add the product quantity to the supplier
      customerSupplierQuantity[customerName][supplierName].totalQuantity += quantity;

      // Add the product details to the supplier's products list for that customer
      customerSupplierQuantity[customerName][supplierName].products.push({
        productName: product.productName,
        quantity
      });
    });
  });

  type topSupplierPerCustomerProducts = prods;

  // Find the supplier with the most products for each customer. supplier whose products were bought by many customers
  const topSupplierPerCustomer: {
    [key: string]: { supplier: string; totalQuantity: number; productsSold: topSupplierPerCustomerProducts[] };
  } = {};

  for (const customerName in customerSupplierQuantity) {
    let maxQuantity = 0;
    let topSupplier = '';

    let productsSold: topSupplierPerCustomerProducts[] = [];

    for (const supplierName in customerSupplierQuantity[customerName]) {
      const supplierData = customerSupplierQuantity[customerName][supplierName];
      if (supplierData.totalQuantity > maxQuantity) {
        maxQuantity = supplierData.totalQuantity;
        topSupplier = supplierName;

        productsSold = supplierData.products;
      }
    }

    topSupplierPerCustomer[customerName] = {
      supplier: topSupplier,
      totalQuantity: maxQuantity,
      productsSold
    };
  }

  return topSupplierPerCustomer;
};

const Dashboard = () => {
  // State for date range filter
  const [startDate, setStartDate] = useState<Date>(new Date('2025-01-21')); // default start date
  const [endDate, setEndDate] = useState<Date>(new Date('2025-01-22')); // default end date

  const {
    data: response,
    isLoading,
    isError
  } = useGetTransactionsInsightsQuery(
    { startDate: formatDate(startDate), endDate: formatDate(endDate) },
    {
      skip: !startDate || !endDate // Skip the query if either date is not provided
    }
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const transactionData = response?.data.transactions ?? [];
  const totalSales = response?.data.totalSales ?? 0;

  console.log('transaction data is ', response?.data);

  function formatDate(inputDateStr: Date) {
    const inputDate = new Date(inputDateStr);

    // Get the year, month, and day
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(inputDate.getDate()).padStart(2, '0');

    // Return the formatted date
    return `${year}-${month}-${day}`;
  }

  // State for selected transaction details
  // const [selectedTransaction, setSelectedTransaction] = useState(null);

  // console.log('____=====______ selectedTransaction ', selectedTransaction)

  const filteredTransactionss: Transaction[] = useMemo(
    () =>
      transactionData.filter((transaction) => {
        const transactionDate = new Date(transaction.transactionDateCreated!);
        return transactionDate >= startDate && transactionDate <= endDate;
      }),
    [transactionData, startDate, endDate]
  );

  if (isLoading) {
    return <p>transactions loadding ....</p>;
  }

  if (isError) {
    return <p>Error fetching transactions </p>;
  }

  // Get the top customer for each supplier
  const topCustomerPerSupplier = getTopCustomerPerSupplier(filteredTransactionss);

  // Prepare chart data
  const supplierNames = Object.keys(topCustomerPerSupplier);
  const customerNames = supplierNames.map((supplier) => topCustomerPerSupplier[supplier].customer);
  const quantitiess = supplierNames.map((supplier) => topCustomerPerSupplier[supplier].quantity);

  const topCustomerChartData = {
    labels: supplierNames,
    datasets: [
      {
        label: 'Top Customer by Supplier',
        data: quantitiess,
        backgroundColor: '#36A2EB',
        borderColor: '#36A2EB',
        borderWidth: 1
      }
    ]
  };

  const topSupplierPerCustomer = getSupplierWithMostProductsForCustomer(filteredTransactionss);

  // Prepare chart data for top supplier per customer
  const customerNamess = Object.keys(topSupplierPerCustomer);
  // const suppliers = customerNamess.map(name => topSupplierPerCustomer[name].supplier);
  const quantities = customerNamess.map((name) => topSupplierPerCustomer[name].totalQuantity);

  const supplierCustomerChartData = {
    labels: customerNames,
    datasets: [
      {
        label: 'Top Supplier per Customer',
        data: quantities,
        backgroundColor: '#FFCE56',
        borderColor: '#FFCE56',
        borderWidth: 1
      }
    ]
  };

  // Filtered transactions
  const filteredTransactions = filterTransactionsByDate(transactionData, startDate, endDate);

  // Sorted transactions based on total cost (highest to lowest)
  const sortedTransactions = getSortedTransactions(filteredTransactions);

  // Calculate customer spending data
  const customerSpendingData = getCustomerSpendingData(filteredTransactions);

  // Calculate product sales data
  const productSalesData = getProductSalesData(filteredTransactions);

  // Bar Chart Data for Customer Spending
  const customerSpendingChartData = {
    labels: customerSpendingData.map((data) => data.customerName),
    datasets: [
      {
        label: 'Total Spending ($)',
        data: customerSpendingData.map((data) => data.totalSpent),
        backgroundColor: ['#FF6384', '#36A2EB'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB']
      }
    ]
  };

  // Bar Chart Data for Product Sales
  const productSalesChartData = {
    labels: productSalesData.map((data) => data.productName),
    datasets: [
      {
        label: 'Sales Quantity',
        data: productSalesData.map((data) => data.totalSales),
        backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384'],
        hoverBackgroundColor: ['#FFCE56', '#36A2EB', '#FF6384']
      }
    ]
  };

  // Sorted Transactions Bar Chart Data
  const sortedTransactionsChartData = {
    labels: sortedTransactions.map((transaction) => transaction.transactionId),
    datasets: [
      {
        label: 'Transaction Total Cost ($)',
        data: sortedTransactions.map((transaction) => transaction.totalCost),
        backgroundColor: ['#FF5733', '#36A2EB', '#FF9F40', '#FF6384'],
        hoverBackgroundColor: ['#FF5733', '#36A2EB', '#FF9F40', '#FF6384']
      }
    ]
  };

  // Handle click on a transaction in the sorted transactions chart
  // const handleTransactionClick = (e: ChartEvent | { index: never; }[]) => {
  //   const clickedIndex = e[0]?.index;
  //   if (clickedIndex !== undefined) {
  //     setSelectedTransaction(sortedTransactions[clickedIndex]);
  //   }
  // };

  // Summed transactions per day
  const dailyTransactions = sumTransactionsPerDay(filteredTransactions);

  // Bar Chart Data for Daily Transactions
  const dailyTransactionsChartData = {
    labels: dailyTransactions.map((data) => data.date),
    datasets: [
      {
        label: 'Total Transactions ($)',
        data: dailyTransactions.map((data) => data.total),
        backgroundColor: '#FF5733',
        hoverBackgroundColor: '#FF9F40'
      }
    ]
  };

  // Count transactions per day
  const dailyTransactionCount = countTransactionsPerDay(filteredTransactions);

  // Bar Chart Data for Daily Transaction Counts
  const dailyTransactionCountChartData = {
    labels: dailyTransactionCount.map((data) => data.date),
    datasets: [
      {
        label: 'Transaction Count',
        data: dailyTransactionCount.map((data) => data.count),
        backgroundColor: '#4BC0C0',
        hoverBackgroundColor: '#36A2EB'
      }
    ]
  };

  // Count supplier appearances
  const supplierAppearances = countSupplierAppearances(filteredTransactions);

  // Bar Chart Data for Supplier Appearances
  const supplierAppearanceChartData = {
    labels: supplierAppearances.map((data) => data.supplier),
    datasets: [
      {
        label: 'Supplier Appearances in Transactions',
        data: supplierAppearances.map((data) => data.count),
        backgroundColor: '#FF6384',
        hoverBackgroundColor: '#FFCE56'
      }
    ]
  };

  // Summarize supplier product sales
  const supplierProductSales = countSupplierProductSales(filteredTransactions);

  // Bar Chart Data for Supplier Product Sales
  const supplierProductSalesChartData = {
    labels: supplierProductSales.map((data) => data.supplierName),
    datasets: [
      {
        label: 'Total Products Sold',
        data: supplierProductSales.map((data) => data.totalQuantity),
        backgroundColor: '#FF6384',
        hoverBackgroundColor: '#FFCE56'
      }
    ]
  };

  //   const filteredTransactions = useMemo(() =>
  //     transactionData.filter((transaction) => {
  //       const transactionDate = new Date(transaction.transactionDateCreated);
  //       return transactionDate >= startDate && transactionDate <= endDate;
  //     }), [startDate, endDate]
  //   );

  // Product Sales Data
  //   const productSalesData = getProductSalesData(filteredTransactions);
  //   const productSalesChartData = {
  //     labels: Object.keys(productSalesData),
  //     datasets: [{
  //       label: 'Total Sales per Product',
  //       data: Object.values(productSalesData),
  //       backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384'],
  //     }]
  //   };

  // Payment Method Breakdown
  const paymentMethodData = getPaymentMethodData(filteredTransactions);
  const paymentMethodChartData = {
    labels: Object.keys(paymentMethodData),
    datasets: [
      {
        data: Object.values(paymentMethodData),
        backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384']
      }
    ]
  };

  // Supplier Sales Data
  const supplierSalesData = getSupplierSalesData(filteredTransactions);
  const supplierSalesChartData = {
    labels: Object.keys(supplierSalesData),
    datasets: [
      {
        label: 'Sales per Supplier',
        data: Object.values(supplierSalesData),
        backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384']
      }
    ]
  };

  // Date-based Sales Data (per day)
  const salesPerDay = groupByDate(filteredTransactions);
  const dateSalesChartData = {
    labels: Object.keys(salesPerDay),
    datasets: [
      {
        label: 'Total Sales per Day',
        data: Object.values(salesPerDay),
        backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384']
      }
    ]
  };

  // Region-Based Breakdown (example)
  const regionData = filteredTransactions.reduce((acc: { [key: string]: number }, transaction) => {
    const region = transaction.customer!.country!; // Assuming country is used for region
    acc[region] = acc[region] ? acc[region] + transaction.totalCost : transaction.totalCost;
    return acc;
  }, {});
  const regionChartData = {
    labels: Object.keys(regionData),
    datasets: [
      {
        label: 'Sales per Region',
        data: Object.values(regionData),
        backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384']
      }
    ]
  };

  // Supplier Sales by Customer Data
  const customerSupplierSalesData = getSupplierSalesByCustomer(filteredTransactions);

  const customerSupplierChartData = {
    labels: Object.keys(customerSupplierSalesData),
    datasets: Object.entries(customerSupplierSalesData).map(([customer, suppliers]) => ({
      label: customer,
      data: Object.values(suppliers),
      backgroundColor: '#FF6384',
      borderColor: '#FF6384',
      borderWidth: 1,
      hoverBackgroundColor: '#FF6384'
    }))
  };

  const setDates = (date: Date | null, type: 'start' | 'end') => {
    if (!date) return;

    if (type === 'start') {
      // Prevent selecting a start date after the end date
      if (date > endDate) {
        alert('Start date cannot be after end date.');
        return;
      }
      setStartDate(date);
    } else {
      // Prevent selecting an end date before the start date
      if (date < startDate) {
        alert('End date cannot be before start date.');
        return;
      }
      setEndDate(date);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="">
          {/* Date Range Picker */}
          <div className="flex items-center mb-6">
            <h3 className="text-xl font-semibold mr-4">Filter by Date</h3>
            <DatePicker
              selected={startDate}
              //onChange={(date) => setStartDate(date)}
              // onChange={(date: Date | null) => {
              //   if (date !== null) {
              //     setStartDate(date); // Only update if date is valid (not null)
              //   }
              // }}
              onChange={(date) => setDates(date, 'start')}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="p-2 border rounded"
              dateFormat="yyyy/MM/dd"
            />
            <span className="mx-4">to</span>
            <DatePicker
              selected={endDate}
              //onChange={(date) => setEndDate(date)}
              // onChange={(date: Date | null) => {
              //   if (date !== null) {
              //     setEndDate(date); // Only update if date is valid (not null)
              //   }
              // }}
              onChange={(date) => setDates(date, 'end')}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="p-2 border rounded"
              dateFormat="yyyy/MM/dd"
            />
            <span className="mx-4">total-sales</span>
            <p> {totalSales}</p>
          </div>

          {/* Dashboard Overview Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Customer Spending</h3>
              <Bar data={customerSpendingChartData} />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Top Product Sales</h3>
              <Bar data={productSalesChartData} />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Sorted Transactions (Highest to Lowest)</h3>
              {/* <Bar data={sortedTransactionsChartData} options={{ onClick: (e) => handleTransactionClick(e) }} /> */}
              <Bar data={sortedTransactionsChartData} />
            </div>
          </div>

          {/* Detailed Transaction Table */}
          {/* Detailed Transaction Table */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold">Transaction Details</h3>
            <table className="min-w-full table-auto mt-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2">Transaction ID</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Total Cost</th>
                  <th className="px-4 py-2">Payment Method</th>
                  <th className="px-4 py-2">Products</th>
                  <th className="px-4 py-2">Suppliers</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.transactionId} className="border-b hover:bg-gray-100">
                    <td className="px-4 py-2">{transaction.transactionId}</td>
                    <td className="px-4 py-2">
                      {transaction.customer!.firstName} {transaction.customer!.lastName}
                      <div>{transaction.customer!.email}</div>
                      <div>{transaction.customer!.phoneNumber}</div>
                    </td>
                    <td className="px-4 py-2">${transaction.totalCost}</td>
                    <td className="px-4 py-2">{transaction.paymentMethod}</td>
                    <td className="px-4 py-2">
                      {transaction.Sales.map((product, idx) => (
                        <div key={idx}>
                          {product.quantity} x {product.productName} - ${product.productTotalCost}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-2">
                      {transaction.Sales.map((product, idx) => (
                        <div key={idx}>Supplier: {product.supplierProduct?.supplier!.name}</div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Dashboard Overview Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Transactions per Day</h3>
              <Bar data={dailyTransactionsChartData} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Transactions per Day (Count)</h3>
              <Bar data={dailyTransactionCountChartData} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Supplier Appearances in Transactions</h3>
              <Bar data={supplierAppearanceChartData} />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Supplier Product Sales</h3>
              <Bar data={supplierProductSalesChartData} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">Product Sales</h3>
          <Bar data={productSalesChartData} />
        </div> */}

            {/* Payment Method Chart */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Payment Method Breakdown</h3>
              <Pie data={paymentMethodChartData} />
            </div>

            {/* Supplier Sales Chart */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Supplier Sales</h3>
              <Bar data={supplierSalesChartData} />
            </div>
            {/* Date-Based Sales Chart */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <h3 className="text-xl font-semibold">Sales per Day</h3>
              <Bar data={dateSalesChartData} />
            </div>

            {/* Region-Based Breakdown Chart */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <h3 className="text-xl font-semibold">Sales per Region</h3>
              <Pie data={regionChartData} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Supplier Breakdown per Customer</h3>
              <Bar data={customerSupplierChartData} />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">top Customer chart data</h3>
              <Bar data={topCustomerChartData} />
            </div>
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">Transactions per Day (Count)</h3>
          <Bar data={dailyTransactionCountChartData} />
        </div>
      </div> */}
          {/* Display Customer and Product Data */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold">Top Customers and Their Purchased Quantities</h3>
            <table className="min-w-full table-auto mt-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2">Supplier</th>
                  <th className="px-4 py-2">Top Customer</th>
                  <th className="px-4 py-2">Total Quantity Purchased</th>
                </tr>
              </thead>
              <tbody>
                {supplierNames.map((supplier, index) => (
                  <tr key={supplier} className="border-b hover:bg-gray-100">
                    <td className="px-4 py-2">{supplier}</td>
                    <td className="px-4 py-2">{customerNames[index]}</td>
                    <td className="px-4 py-2">{quantities[index]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dashboard Overview Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Top Supplier per Customer */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Top Supplier per Customer</h3>
              <Bar data={supplierCustomerChartData} />
            </div>
          </div>
          {/* Display Customer, Supplier, and Product Data */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold">Top Supplier and Products Sold</h3>
            <table className="min-w-full table-auto mt-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Supplier</th>
                  <th className="px-4 py-2">Total Quantity</th>
                  <th className="px-4 py-2">Products Sold</th>
                </tr>
              </thead>
              <tbody>
                {customerNames.map((customerName) => {
                  const { supplier, totalQuantity, productsSold } = topSupplierPerCustomer[customerName];
                  return (
                    <tr key={customerName} className="border-b hover:bg-gray-100">
                      <td className="px-4 py-2">{customerName}</td>
                      <td className="px-4 py-2">{supplier}</td>
                      <td className="px-4 py-2">{totalQuantity}</td>
                      <td className="px-4 py-2">
                        {productsSold.map((product, index) => (
                          <div key={index}>{`${product.quantity} x ${product.productName}`}</div>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// import { Link } from 'react-router-dom';
// import 'bootstrap-daterangepicker/daterangepicker.css';
// import Chart from 'react-apexcharts';
// import ReactApexChart from 'react-apexcharts';
// import { Doughnut } from 'react-chartjs-2';
// import ApexCharts from 'react-apexcharts';
// import type { ApexOptions } from 'apexcharts';

// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   PointElement,
//   LineElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend
// } from 'chart.js';
// import { all_routes } from '../../routes/all_routes';
// import {
//   customer11,
//   customer12,
//   customer13,
//   customer14,
//   customer15,
//   customer16,
//   customer17,
//   customer18,
//   product1,
//   product10,
//   product11,
//   product12,
//   product13,
//   product14,
//   product15,
//   product16,
//   product3,
//   product4,
//   product5,
//   product6,
//   product7,
//   product8,
//   product9
// } from '../../utils/imagepath';
// import CommonDateRangePicker from '../../components/date-range-picker/common-date-range-picker';
// import { useAppSelector } from '@core/redux/store';

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);
// const NewDashboard = () => {
//   const route: any = all_routes;
//   const userName = useAppSelector((state) => state.auth.user.username);

//   const salesDayChart: any = {
//     chart: {
//       height: 245,
//       type: 'bar' as const,
//       stacked: true,
//       toolbar: {
//         show: false
//       }
//     },
//     colors: ['#FE9F43', '#FFE3CB'],
//     responsive: [
//       {
//         breakpoint: 480,
//         options: {
//           legend: {
//             position: 'bottom',
//             offsetX: -10,
//             offsetY: 0
//           }
//         }
//       }
//     ],
//     plotOptions: {
//       bar: {
//         borderRadius: 8,
//         borderRadiusWhenStacked: 'all',
//         horizontal: false,
//         endingShape: 'rounded'
//       }
//     },
//     series: [
//       {
//         name: 'Sales',
//         data: [18, 20, 10, 18, 25, 18, 10, 20, 40, 8, 30, 20]
//       },
//       {
//         name: 'Purchase',
//         data: [40, 30, 30, 50, 40, 50, 30, 30, 50, 30, 40, 30]
//       }
//     ],
//     xaxis: {
//       categories: ['2 am', '4 am', '6 am', '8 am', '10 am', '12 am', '14 pm', '16 pm', '18 pm', '20 pm', '22 pm', '24 pm'],
//       labels: {
//         style: {
//           colors: '#6B7280',
//           fontSize: '13px'
//         }
//       }
//     },
//     yaxis: {
//       labels: {
//         formatter: (val: any) => `${val}K`,
//         offsetX: -15,
//         style: {
//           colors: '#6B7280',
//           fontSize: '13px'
//         }
//       }
//     },
//     grid: {
//       borderColor: '#E5E7EB',
//       strokeDashArray: 5,
//       padding: {
//         left: -16,
//         top: 0,
//         bottom: 0,
//         right: 0
//       }
//     },
//     legend: {
//       show: false
//     },
//     dataLabels: {
//       enabled: false
//     },
//     fill: {
//       opacity: 1
//     }
//   };

//   const customerChart: ApexOptions = {
//     chart: {
//       type: 'radialBar',
//       height: 130,
//       width: '100%',
//       parentHeightOffset: 0,
//       toolbar: {
//         show: false
//       }
//     },
//     plotOptions: {
//       radialBar: {
//         hollow: {
//           margin: 10,
//           size: '30%'
//         },
//         track: {
//           background: '#E6EAED',
//           strokeWidth: '100%',
//           margin: 5
//         },
//         dataLabels: {
//           name: {
//             offsetY: -5
//           },
//           value: {
//             offsetY: 5
//           }
//         }
//       }
//     },
//     grid: {
//       padding: {
//         top: 0,
//         bottom: 0,
//         left: 0,
//         right: 0
//       }
//     },
//     stroke: {
//       lineCap: 'round'
//     },
//     colors: ['#E04F16', '#0E9384'],
//     labels: ['First Time', 'Return']
//   };

//   const series = [70, 70];

//   const options: ApexOptions = {
//     series: [
//       {
//         name: 'Revenue',
//         data: [9, 25, 25, 20, 20, 18, 25, 15, 20, 12, 8, 20]
//       },
//       {
//         name: 'Expenses',
//         data: [-10, -18, -9, -20, -20, -10, -20, -20, -8, -15, -18, -20]
//       }
//     ],
//     grid: {
//       padding: {
//         top: 5,
//         right: 5
//       }
//     },
//     colors: ['#0E9384', '#E04F16'],
//     chart: {
//       type: 'bar',
//       height: 290,
//       stacked: true,
//       zoom: {
//         enabled: true
//       }
//     },
//     responsive: [
//       {
//         breakpoint: 280,
//         options: {
//           legend: {
//             position: 'bottom',
//             offsetY: 0
//           }
//         }
//       }
//     ],
//     plotOptions: {
//       bar: {
//         horizontal: false,
//         borderRadius: 4,
//         borderRadiusApplication: 'around',
//         borderRadiusWhenStacked: 'all',
//         columnWidth: '20%'
//       }
//     },
//     dataLabels: {
//       enabled: false
//     },
//     yaxis: {
//       labels: {
//         offsetX: -15,
//         formatter: (val: any) => {
//           return val / 1 + 'K';
//         }
//       },
//       min: -30,
//       max: 30,
//       tickAmount: 6
//     },
//     xaxis: {
//       categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
//     },
//     legend: {
//       show: false
//     },
//     fill: {
//       opacity: 1
//     }
//   };

//   const data: any = {
//     datasets: [
//       {
//         label: ['Lifestyles', 'Sports', 'Electronics'],
//         data: [16, 24, 50],
//         backgroundColor: ['#092C4C', '#E04F16', '#FE9F43'],
//         borderWidth: 5,
//         borderRadius: 10,
//         hoverBorderWidth: 0,
//         cutout: '50%'
//       }
//     ]
//   };
//   const option = {
//     responsive: true,
//     maintainAspectRatio: false,
//     layout: {
//       padding: {
//         top: -20,
//         bottom: -20
//       }
//     },
//     plugins: {
//       legend: {
//         display: false
//       }
//     }
//   };

//   const heat_chart = {
//     chart: {
//       type: 'heatmap' as const,
//       height: 370
//     },
//     plotOptions: {
//       heatmap: {
//         radius: 4,
//         enableShades: false,
//         colorScale: {
//           ranges: [
//             {
//               from: 0,
//               to: 99,
//               color: '#FFE3CB'
//             },
//             {
//               from: 100,
//               to: 200,
//               color: '#FE9F43'
//             }
//           ]
//         }
//       }
//     },
//     legend: {
//       show: false
//     },
//     dataLabels: {
//       enabled: false
//     },
//     grid: {
//       padding: {
//         top: -20,
//         bottom: 0,
//         left: 0,
//         right: 0
//       }
//     },
//     yaxis: {
//       labels: {
//         offsetX: -15
//       }
//     },
//     series: [
//       {
//         name: '2 Am',
//         data: [
//           { x: 'Mon', y: 100 },
//           { x: 'Tue', y: 100 },
//           { x: 'Wed', y: 100 },
//           { x: 'Thu', y: 32 },
//           { x: 'Fri', y: 32 },
//           { x: 'Sat', y: 32 },
//           { x: 'Sun', y: 32 }
//         ]
//       },
//       {
//         name: '4 Am',
//         data: [
//           { x: 'Mon', y: 100, color: '#ff5722' },
//           { x: 'Tue', y: 100 },
//           { x: 'Wed', y: 100 },
//           { x: 'Thu', y: 120 },
//           { x: 'Fri', y: 32 },
//           { x: 'Sat', y: 50 },
//           { x: 'Sun', y: 40 }
//         ]
//       },
//       {
//         name: '6 Am',
//         data: [
//           { x: 'Mon', y: 22 },
//           { x: 'Tue', y: 29 },
//           { x: 'Wed', y: 13 },
//           { x: 'Thu', y: 32 },
//           { x: 'Fri', y: 32 },
//           { x: 'Sat', y: 32 },
//           { x: 'Sun', y: 32 }
//         ]
//       },
//       {
//         name: '8 Am',
//         data: [
//           { x: 'Mon', y: 0 },
//           { x: 'Tue', y: 29 },
//           { x: 'Wed', y: 13 },
//           { x: 'Thu', y: 32 },
//           { x: 'Fri', y: 30 },
//           { x: 'Sat', y: 100 },
//           { x: 'Sun', y: 100 }
//         ]
//       },
//       {
//         name: '10 Am',
//         data: [
//           { x: 'Mon', y: 200 },
//           { x: 'Tue', y: 200 },
//           { x: 'Wed', y: 200 },
//           { x: 'Thu', y: 32 },
//           { x: 'Fri', y: 0 },
//           { x: 'Sat', y: 0 },
//           { x: 'Sun', y: 32 }
//         ]
//       },
//       {
//         name: '12 Am',
//         data: [
//           { x: 'Mon', y: 0 },
//           { x: 'Tue', y: 0 },
//           { x: 'Wed', y: 75 },
//           { x: 'Thu', y: 0 },
//           { x: 'Fri', y: 0 },
//           { x: 'Sat', y: 0 },
//           { x: 'Sun', y: 0 }
//         ]
//       },
//       {
//         name: '14 Pm',
//         data: [
//           { x: 'Mon', y: 0 },
//           { x: 'Tue', y: 20 },
//           { x: 'Wed', y: 13 },
//           { x: 'Thu', y: 32 },
//           { x: 'Fri', y: 0 },
//           { x: 'Sat', y: 0 },
//           { x: 'Sun', y: 32 }
//         ]
//       },
//       {
//         name: '16 Pm',
//         data: [
//           { x: 'Mon', y: 13 },
//           { x: 'Tue', y: 20 },
//           { x: 'Wed', y: 13 },
//           { x: 'Thu', y: 32 },
//           { x: 'Fri', y: 200 },
//           { x: 'Sat', y: 13 },
//           { x: 'Sun', y: 32 }
//         ]
//       },
//       {
//         name: '18 Am',
//         data: [
//           { x: 'Mon', y: 0 },
//           { x: 'Tue', y: 20 },
//           { x: 'Wed', y: 13 },
//           { x: 'Thu', y: 32 },
//           { x: 'Fri', y: 0 },
//           { x: 'Sat', y: 200 },
//           { x: 'Sun', y: 200 }
//         ]
//       }
//     ]
//   };

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-2">
//           <div className="mb-3">
//             <h1 className="mb-1">Welcome, {userName}</h1>
//             <p className="fw-medium">
//               You have <span className="text-primary fw-bold">200+</span> Orders, Today
//             </p>
//           </div>
//           <div className="input-icon-start position-relative mb-3">
//             <span className="input-icon-addon fs-16 text-gray-9">
//               <i className="ti ti-calendar" />
//             </span>
//             <CommonDateRangePicker />
//           </div>
//         </div>
//         <div className="alert bg-orange-transparent alert-dismissible fade show mb-4">
//           <div>
//             <span>
//               {' '}
//               <i className="ti ti-info-circle fs-14 text-orange me-2" /> Your Product{' '}
//             </span>
//             <span className="text-orange fw-semibold"> Apple Iphone 15 is running Low, </span> already below 5 Pcs.,
//             <Link to="#" className="link-orange text-decoration-underline fw-semibold" data-bs-toggle="modal" data-bs-target="#add-stock">
//               Add Stock
//             </Link>
//           </div>
//           <button type="button" className="btn-close text-gray-9 fs-14" data-bs-dismiss="alert" aria-label="Close">
//             <i className="ti ti-x" />
//           </button>
//         </div>
//         <div className="row">
//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="card bg-primary sale-widget flex-fill">
//               <div className="card-body d-flex align-items-center">
//                 <span className="sale-icon bg-white text-primary">
//                   <i className="ti ti-file-text fs-24" />
//                 </span>
//                 <div className="ms-2">
//                   <p className="text-white mb-1">Total Sales</p>
//                   <div className="d-inline-flex align-items-center flex-wrap gap-2">
//                     <h4 className="text-white">$48,988,078</h4>
//                     <span className="badge badge-soft-primary">
//                       <i className="ti ti-arrow-up me-1" />
//                       +22%
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="card bg-secondary sale-widget flex-fill">
//               <div className="card-body d-flex align-items-center">
//                 <span className="sale-icon bg-white text-secondary">
//                   <i className="ti ti-repeat fs-24" />
//                 </span>
//                 <div className="ms-2">
//                   <p className="text-white mb-1">Total Sales Return</p>
//                   <div className="d-inline-flex align-items-center flex-wrap gap-2">
//                     <h4 className="text-white">$16,478,145</h4>
//                     <span className="badge badge-soft-danger">
//                       <i className="ti ti-arrow-down me-1" />
//                       -22%
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="card bg-teal sale-widget flex-fill">
//               <div className="card-body d-flex align-items-center">
//                 <span className="sale-icon bg-white text-teal">
//                   <i className="ti ti-gift fs-24" />
//                 </span>
//                 <div className="ms-2">
//                   <p className="text-white mb-1">Total Purchase</p>
//                   <div className="d-inline-flex align-items-center flex-wrap gap-2">
//                     <h4 className="text-white">$24,145,789</h4>
//                     <span className="badge badge-soft-success">
//                       <i className="ti ti-arrow-up me-1" />
//                       +22%
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="card bg-info sale-widget flex-fill">
//               <div className="card-body d-flex align-items-center">
//                 <span className="sale-icon bg-white text-info">
//                   <i className="ti ti-brand-pocket fs-24" />
//                 </span>
//                 <div className="ms-2">
//                   <p className="text-white mb-1">Total Purchase Return</p>
//                   <div className="d-inline-flex align-items-center flex-wrap gap-2">
//                     <h4 className="text-white">$18,458,747</h4>
//                     <span className="badge badge-soft-success">
//                       <i className="ti ti-arrow-up me-1" />
//                       +22%
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="row">
//           {/* Profit */}
//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="card revenue-widget flex-fill">
//               <div className="card-body">
//                 <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
//                   <div>
//                     <h4 className="mb-1">$8,458,798</h4>
//                     <p>Profit</p>
//                   </div>
//                   <span className="revenue-icon bg-cyan-transparent text-cyan">
//                     <i className="fa-solid fa-layer-group fs-16" />
//                   </span>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between">
//                   <p className="mb-0">
//                     <span className="fs-13 fw-bold text-success">+35%</span> vs Last Month
//                   </p>
//                   <Link to="profit-and-loss.html" className="text-decoration-underline fs-13 fw-medium">
//                     View All
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* /Profit */}
//           {/* Invoice */}
//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="card revenue-widget flex-fill">
//               <div className="card-body">
//                 <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
//                   <div>
//                     <h4 className="mb-1">$48,988,78</h4>
//                     <p>Invoice Due</p>
//                   </div>
//                   <span className="revenue-icon bg-teal-transparent text-teal">
//                     <i className="ti ti-chart-pie fs-16" />
//                   </span>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between">
//                   <p className="mb-0">
//                     <span className="fs-13 fw-bold text-success">+35%</span> vs Last Month
//                   </p>
//                   <Link to={route.invoicereport} className="text-decoration-underline fs-13 fw-medium">
//                     View All
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* /Invoice */}
//           {/* Expenses */}
//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="card revenue-widget flex-fill">
//               <div className="card-body">
//                 <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
//                   <div>
//                     <h4 className="mb-1">$8,980,097</h4>
//                     <p>Total Expenses</p>
//                   </div>
//                   <span className="revenue-icon bg-orange-transparent text-orange">
//                     <i className="ti ti-lifebuoy fs-16" />
//                   </span>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between">
//                   <p className="mb-0">
//                     <span className="fs-13 fw-bold text-success">+41%</span> vs Last Month
//                   </p>
//                   <Link to={route.expenselist} className="text-decoration-underline fs-13 fw-medium">
//                     View All
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* /Expenses */}
//           {/* Returns */}
//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="card revenue-widget flex-fill">
//               <div className="card-body">
//                 <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
//                   <div>
//                     <h4 className="mb-1">$78,458,798</h4>
//                     <p>Total Payment Returns</p>
//                   </div>
//                   <span className="revenue-icon bg-indigo-transparent text-indigo">
//                     <i className="ti ti-hash fs-16" />
//                   </span>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between">
//                   <p className="mb-0">
//                     <span className="fs-13 fw-bold text-danger">-20%</span> vs Last Month
//                   </p>
//                   <Link to={route.salesreport} className="text-decoration-underline fs-13 fw-medium">
//                     View All
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* /Returns */}
//         </div>
//         <div className="row">
//           <>
//             {/* Sales & Purchase */}
//             <div className="col-xxl-8 col-xl-7 col-sm-12 col-12 d-flex">
//               <div className="card flex-fill">
//                 <div className="card-header d-flex justify-content-between align-items-center">
//                   <div className="d-inline-flex align-items-center">
//                     <span className="title-icon bg-soft-primary fs-16 me-2">
//                       <i className="ti ti-shopping-cart" />
//                     </span>
//                     <h5 className="card-title mb-0">Sales &amp; Purchase</h5>
//                   </div>
//                   <ul className="nav btn-group custom-btn-group">
//                     <Link className="btn btn-outline-light" to="#">
//                       1D
//                     </Link>
//                     <Link className="btn btn-outline-light" to="#">
//                       1W
//                     </Link>
//                     <Link className="btn btn-outline-light" to="#">
//                       1M
//                     </Link>
//                     <Link className="btn btn-outline-light" to="#">
//                       3M
//                     </Link>
//                     <Link className="btn btn-outline-light" to="#">
//                       6M
//                     </Link>
//                     <Link className="btn btn-outline-light active" to="#">
//                       1Y
//                     </Link>
//                   </ul>
//                 </div>
//                 <div className="card-body pb-0">
//                   <div>
//                     <div className="d-flex align-items-center gap-2">
//                       <div className="border p-2 br-8">
//                         <p className="d-inline-flex align-items-center mb-1">
//                           <i className="ti ti-circle-filled fs-8 text-primary-300 me-1" />
//                           Total Purchase
//                         </p>
//                         <h4>3K</h4>
//                       </div>
//                       <div className="border p-2 br-8">
//                         <p className="d-inline-flex align-items-center mb-1">
//                           <i className="ti ti-circle-filled fs-8 text-primary me-1" />
//                           Total Sales
//                         </p>
//                         <h4>1K</h4>
//                       </div>
//                     </div>
//                     <div id="sales-daychart">
//                       <Chart options={salesDayChart} series={salesDayChart.series} type="bar" height={245} />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             {/* /Sales & Purchase */}
//           </>

//           {/* Top Selling Products */}
//           <div className="col-xxl-4 col-xl-5 d-flex">
//             <div className="card flex-fill">
//               <div className="card-header">
//                 <div className="d-inline-flex align-items-center">
//                   <span className="title-icon bg-soft-info fs-16 me-2">
//                     <i className="ti ti-info-circle" />
//                   </span>
//                   <h5 className="card-title mb-0">Overall Information</h5>
//                 </div>
//               </div>
//               <div className="card-body">
//                 <div className="row g-3">
//                   <div className="col-md-4">
//                     <div className="info-item border bg-light p-3 text-center">
//                       <div className="mb-3 text-info fs-24">
//                         <i className="ti ti-user-check" />
//                       </div>
//                       <p className="mb-1">Suppliers</p>
//                       <h5>6987</h5>
//                     </div>
//                   </div>
//                   <div className="col-md-4">
//                     <div className="info-item border bg-light p-3 text-center">
//                       <div className="mb-3 text-orange fs-24">
//                         <i className="ti ti-users" />
//                       </div>
//                       <p className="mb-1">Customer</p>
//                       <h5>4896</h5>
//                     </div>
//                   </div>
//                   <div className="col-md-4">
//                     <div className="info-item border bg-light p-3 text-center">
//                       <div className="mb-3 text-teal fs-24">
//                         <i className="ti ti-shopping-cart" />
//                       </div>
//                       <p className="mb-1">Orders</p>
//                       <h5>487</h5>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="card-footer pb-sm-0">
//                 <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
//                   <h6>Customers Overview</h6>
//                   <div className="dropdown dropdown-wraper">
//                     <Link to="#" className="dropdown-toggle btn btn-sm" data-bs-toggle="dropdown" aria-expanded="false">
//                       <i className="ti ti-calendar me-1" />
//                       Today
//                     </Link>
//                     <ul className="dropdown-menu p-3">
//                       <li>
//                         <Link to="#" className="dropdown-item">
//                           Today
//                         </Link>
//                       </li>
//                       <li>
//                         <Link to="#" className="dropdown-item">
//                           Weekly
//                         </Link>
//                       </li>
//                       <li>
//                         <Link to="#" className="dropdown-item">
//                           Monthly
//                         </Link>
//                       </li>
//                     </ul>
//                   </div>
//                 </div>
//                 <div className="row align-items-center">
//                   <div className="col-sm-5">
//                     <div id="customer-chart">
//                       <Chart options={customerChart} series={series} type="radialBar" height={130} />
//                     </div>
//                   </div>
//                   <div className="col-sm-7">
//                     <div className="row gx-0">
//                       <div className="col-sm-6">
//                         <div className="text-center border-end">
//                           <h2 className="mb-1">5.5K</h2>
//                           <p className="text-orange mb-2">First Time</p>
//                           <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                             <i className="ti ti-arrow-up-left me-1" />
//                             25%
//                           </span>
//                         </div>
//                       </div>
//                       <div className="col-sm-6">
//                         <div className="text-center">
//                           <h2 className="mb-1">3.5K</h2>
//                           <p className="text-teal mb-2">Return</p>
//                           <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                             <i className="ti ti-arrow-up-left me-1" />
//                             21%
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="row">
//           {/* Top Selling Products */}
//           <div className="col-xxl-4 col-md-6 d-flex">
//             <div className="card flex-fill">
//               <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
//                 <div className="d-inline-flex align-items-center">
//                   <span className="title-icon bg-soft-pink fs-16 me-2">
//                     <i className="ti ti-box" />
//                   </span>
//                   <h5 className="card-title mb-0">Top Selling Products</h5>
//                 </div>
//                 <div className="dropdown">
//                   <Link to="#" className="dropdown-toggle btn btn-sm btn-white" data-bs-toggle="dropdown" aria-expanded="false">
//                     <i className="ti ti-calendar me-1" />
//                     Today
//                   </Link>
//                   <ul className="dropdown-menu p-3">
//                     <li>
//                       <Link to="#" className="dropdown-item">
//                         Today
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item">
//                         Weekly
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item">
//                         Monthly
//                       </Link>
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//               <div className="card-body sell-product">
//                 <div className="d-flex align-items-center justify-content-between border-bottom">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg">
//                       <img src={product1} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fw-bold mb-1">
//                         <Link to="#">Charger Cable - Lighting</Link>
//                       </h6>
//                       <div className="d-flex align-items-center item-list">
//                         <p>$187</p>
//                         <p>247+ Sales</p>
//                       </div>
//                     </div>
//                   </div>
//                   <span className="badge bg-outline-success badge-xs d-inline-flex align-items-center">
//                     <i className="ti ti-arrow-up-left me-1" />
//                     25%
//                   </span>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between border-bottom">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg">
//                       <img src={product16} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fw-bold mb-1">
//                         <Link to="#">Yves Saint Eau De Parfum</Link>
//                       </h6>
//                       <div className="d-flex align-items-center item-list">
//                         <p>$145</p>
//                         <p>289+ Sales</p>
//                       </div>
//                     </div>
//                   </div>
//                   <span className="badge bg-outline-success badge-xs d-inline-flex align-items-center">
//                     <i className="ti ti-arrow-up-left me-1" />
//                     25%
//                   </span>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between border-bottom">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg">
//                       <img src={product3} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fw-bold mb-1">
//                         <Link to="#">Apple Airpods 2</Link>
//                       </h6>
//                       <div className="d-flex align-items-center item-list">
//                         <p>$458</p>
//                         <p>300+ Sales</p>
//                       </div>
//                     </div>
//                   </div>
//                   <span className="badge bg-outline-success badge-xs d-inline-flex align-items-center">
//                     <i className="ti ti-arrow-up-left me-1" />
//                     25%
//                   </span>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between border-bottom">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg">
//                       <img src={product4} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fw-bold mb-1">
//                         <Link to="#">Vacuum Cleaner</Link>
//                       </h6>
//                       <div className="d-flex align-items-center item-list">
//                         <p>$139</p>
//                         <p>225+ Sales</p>
//                       </div>
//                     </div>
//                   </div>
//                   <span className="badge bg-outline-danger badge-xs d-inline-flex align-items-center">
//                     <i className="ti ti-arrow-down-left me-1" />
//                     21%
//                   </span>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg">
//                       <img src={product5} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fw-bold mb-1">
//                         <Link to="#">Samsung Galaxy S21 Fe 5g</Link>
//                       </h6>
//                       <div className="d-flex align-items-center item-list">
//                         <p>$898</p>
//                         <p>365+ Sales</p>
//                       </div>
//                     </div>
//                   </div>
//                   <span className="badge bg-outline-success badge-xs d-inline-flex align-items-center">
//                     <i className="ti ti-arrow-up-left me-1" />
//                     25%
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* /Top Selling Products */}
//           {/* Low Stock Products */}
//           <div className="col-xxl-4 col-md-6 d-flex">
//             <div className="card flex-fill">
//               <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
//                 <div className="d-inline-flex align-items-center">
//                   <span className="title-icon bg-soft-danger fs-16 me-2">
//                     <i className="ti ti-alert-triangle" />
//                   </span>
//                   <h5 className="card-title mb-0">Low Stock Products</h5>
//                 </div>
//                 <Link to={route.lowstock} className="fs-13 fw-bold text-decoration-underline">
//                   View All
//                 </Link>
//               </div>
//               <div className="card-body">
//                 <div className="d-flex align-items-center justify-content-between mb-4">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg">
//                       <img src={product6} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fw-bold mb-1">
//                         <Link to="#">Dell XPS 13</Link>
//                       </h6>
//                       <p className="fs-13">ID : #665814</p>
//                     </div>
//                   </div>
//                   <div className="text-end">
//                     <p className="fs-13 mb-1">Instock</p>
//                     <h6 className="text-orange fw-bold">08</h6>
//                   </div>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between mb-4">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg">
//                       <img src={product7} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fw-bold mb-1">
//                         <Link to="#">Vacuum Cleaner Robot</Link>
//                       </h6>
//                       <p className="fs-13">ID : #940004</p>
//                     </div>
//                   </div>
//                   <div className="text-end">
//                     <p className="fs-13 mb-1">Instock</p>
//                     <h6 className="text-orange fw-bold">14</h6>
//                   </div>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between mb-4">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg">
//                       <img src={product8} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fw-bold mb-1">
//                         <Link to="#">KitchenAid Stand Mixer</Link>
//                       </h6>
//                       <p className="fs-13">ID : #325569</p>
//                     </div>
//                   </div>
//                   <div className="text-end">
//                     <p className="fs-13 mb-1">Instock</p>
//                     <h6 className="text-orange fw-bold">21</h6>
//                   </div>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between mb-4">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg">
//                       <img src={product9} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fw-bold mb-1">
//                         <Link to="#">{`Levi's Trucker Jacket`}</Link>
//                       </h6>
//                       <p className="fs-13">ID : #124588</p>
//                     </div>
//                   </div>
//                   <div className="text-end">
//                     <p className="fs-13 mb-1">Instock</p>
//                     <h6 className="text-orange fw-bold">12</h6>
//                   </div>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between mb-0">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg">
//                       <img src={product10} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fw-bold mb-1">
//                         <Link to="#">{`Lay's Classic`}</Link>
//                       </h6>
//                       <p className="fs-13">ID : #365586</p>
//                     </div>
//                   </div>
//                   <div className="text-end">
//                     <p className="fs-13 mb-1">Instock</p>
//                     <h6 className="text-orange fw-bold">10</h6>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* /Low Stock Products */}
//           {/* Recent Sales */}
//           <div className="col-xxl-4 col-md-12 d-flex">
//             <div className="card flex-fill">
//               <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
//                 <div className="d-inline-flex align-items-center">
//                   <span className="title-icon bg-soft-pink fs-16 me-2">
//                     <i className="ti ti-box" />
//                   </span>
//                   <h5 className="card-title mb-0">Recent Sales</h5>
//                 </div>
//                 <div className="dropdown">
//                   <Link to="#" className="dropdown-toggle btn btn-sm btn-white" data-bs-toggle="dropdown" aria-expanded="false">
//                     <i className="ti ti-calendar me-1" />
//                     Weekly
//                   </Link>
//                   <ul className="dropdown-menu p-3">
//                     <li>
//                       <Link to="#" className="dropdown-item">
//                         Today
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item">
//                         Weekly
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item">
//                         Monthly
//                       </Link>
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//               <div className="card-body">
//                 <div className="d-flex align-items-center justify-content-between mb-4">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg">
//                       <img src={product11} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fw-bold mb-1">
//                         <Link to="#">Apple Watch Series 9</Link>
//                       </h6>
//                       <div className="d-flex align-items-center item-list">
//                         <p>Electronics</p>
//                         <p className="text-gray-9">$640</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-end">
//                     <p className="fs-13 mb-1">Today</p>
//                     <span className="badge bg-purple badge-xs d-inline-flex align-items-center">
//                       <i className="ti ti-circle-filled fs-5 me-1" />
//                       Processing
//                     </span>
//                   </div>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between mb-4">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg">
//                       <img src={product12} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fw-bold mb-1">
//                         <Link to="#">Gold Bracelet</Link>
//                       </h6>
//                       <div className="d-flex align-items-center item-list">
//                         <p>Fashion</p>
//                         <p className="text-gray-9">$126</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-end">
//                     <p className="fs-13 mb-1">Today</p>
//                     <span className="badge badge-danger badge-xs d-inline-flex align-items-center">
//                       <i className="ti ti-circle-filled fs-5 me-1" />
//                       Cancelled
//                     </span>
//                   </div>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between mb-4">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg">
//                       <img src={product13} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fw-bold mb-1">
//                         <Link to="#">Parachute Down Duvet</Link>
//                       </h6>
//                       <div className="d-flex align-items-center item-list">
//                         <p>Health</p>
//                         <p className="text-gray-9">$69</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-end">
//                     <p className="fs-13 mb-1">15 Jan 2025</p>
//                     <span className="badge badge-cyan badge-xs d-inline-flex align-items-center">
//                       <i className="ti ti-circle-filled fs-5 me-1" />
//                       Onhold
//                     </span>
//                   </div>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between mb-4">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg">
//                       <img src={product14} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fw-bold mb-1">
//                         <Link to="#">YETI Rambler Tumbler</Link>
//                       </h6>
//                       <div className="d-flex align-items-center item-list">
//                         <p>Sports</p>
//                         <p className="text-gray-9">$65</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-end">
//                     <p className="fs-13 mb-1">12 Jan 2025</p>
//                     <span className="badge bg-purple badge-xs d-inline-flex align-items-center">
//                       <i className="ti ti-circle-filled fs-5 me-1" />
//                       Processing
//                     </span>
//                   </div>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between mb-0">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg">
//                       <img src={product15} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fw-bold mb-1">
//                         <Link to="#">Osmo Genius Starter Kit</Link>
//                       </h6>
//                       <div className="d-flex align-items-center item-list">
//                         <p>Lifestyles</p>
//                         <p className="text-gray-9">$87.56</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-end">
//                     <p className="fs-13 mb-1">11 Jan 2025</p>
//                     <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                       <i className="ti ti-circle-filled fs-5 me-1" />
//                       Completed
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* /Recent Sales */}
//         </div>
//         <div className="row">
//           {/* Sales Statics */}
//           <div className="col-xl-6 col-sm-12 col-12 d-flex">
//             <div className="card flex-fill">
//               <div className="card-header d-flex justify-content-between align-items-center">
//                 <div className="d-inline-flex align-items-center">
//                   <span className="title-icon bg-soft-danger fs-16 me-2">
//                     <i className="ti ti-alert-triangle" />
//                   </span>
//                   <h5 className="card-title mb-0">Sales Statics</h5>
//                 </div>
//                 <div className="dropdown">
//                   <Link to="#" className="dropdown-toggle btn btn-sm btn-white" data-bs-toggle="dropdown" aria-expanded="false">
//                     <i className="ti ti-calendar me-1" />
//                     2025
//                   </Link>
//                   <ul className="dropdown-menu p-3">
//                     <li>
//                       <Link to="#" className="dropdown-item">
//                         2025
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item">
//                         2022
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item">
//                         2021
//                       </Link>
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//               <div className="card-body pb-0">
//                 <div className="d-flex align-items-center flex-wrap gap-2">
//                   <div className="border p-2 br-8">
//                     <h5 className="d-inline-flex align-items-center text-teal">
//                       $12,189
//                       <span className="badge badge-success badge-xs d-inline-flex align-items-center ms-2">
//                         <i className="ti ti-arrow-up-left me-1" />
//                         25%
//                       </span>
//                     </h5>
//                     <p>Revenue</p>
//                   </div>
//                   <div className="border p-2 br-8">
//                     <h5 className="d-inline-flex align-items-center text-orange">
//                       $48,988,078
//                       <span className="badge badge-danger badge-xs d-inline-flex align-items-center ms-2">
//                         <i className="ti ti-arrow-down-right me-1" />
//                         25%
//                       </span>
//                     </h5>
//                     <p>Expense</p>
//                   </div>
//                 </div>
//                 <div id="sales-statistics">
//                   <ReactApexChart options={options} series={options.series} type="bar" height={290} />
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* /Sales Statics */}
//           {/* Recent Transactions */}
//           <div className="col-xl-6 col-sm-12 col-12 d-flex">
//             <div className="card flex-fill">
//               <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-3">
//                 <div className="d-inline-flex align-items-center">
//                   <span className="title-icon bg-soft-orange fs-16 me-2">
//                     <i className="ti ti-flag" />
//                   </span>
//                   <h5 className="card-title mb-0">Recent Transactions</h5>
//                 </div>
//                 <Link to={route.onlineorder} className="fs-13 fw-medium text-decoration-underline">
//                   View All
//                 </Link>
//               </div>
//               <div className="card-body p-0">
//                 <ul className="nav nav-tabs nav-justified transaction-tab">
//                   <li className="nav-item">
//                     <Link className="nav-link active" to="#sale" data-bs-toggle="tab">
//                       Sale
//                     </Link>
//                   </li>
//                   <li className="nav-item">
//                     <Link className="nav-link" to="#purchase-transaction" data-bs-toggle="tab">
//                       Purchase
//                     </Link>
//                   </li>
//                   <li className="nav-item">
//                     <Link className="nav-link" to="#quotation" data-bs-toggle="tab">
//                       Quotation
//                     </Link>
//                   </li>
//                   <li className="nav-item">
//                     <Link className="nav-link" to="#expenses" data-bs-toggle="tab">
//                       Expenses
//                     </Link>
//                   </li>
//                   <li className="nav-item">
//                     <Link className="nav-link" to="#invoices" data-bs-toggle="tab">
//                       Invoices
//                     </Link>
//                   </li>
//                 </ul>
//                 <div className="tab-content">
//                   <div className="tab-pane show active" id="sale">
//                     <div className="table-responsive">
//                       <table className="table table-borderless custom-table">
//                         <thead className="thead-light">
//                           <tr>
//                             <th>Date</th>
//                             <th>Customer</th>
//                             <th>Status</th>
//                             <th>Total</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           <tr>
//                             <td>24 May 2025</td>
//                             <td>
//                               <div className="d-flex align-items-center file-name-icon">
//                                 <Link to="#" className="avatar avatar-md">
//                                   <img src={customer16} className="img-fluid" alt="img" />
//                                 </Link>
//                                 <div className="ms-2">
//                                   <h6 className="fw-medium">
//                                     <Link to="#">Andrea Willer</Link>
//                                   </h6>
//                                   <span className="fs-13 text-orange">#114589</span>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>
//                               <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Completed
//                               </span>
//                             </td>
//                             <td className="fs-16 fw-bold text-gray-9">$4,560</td>
//                           </tr>
//                           <tr>
//                             <td>23 May 2025</td>
//                             <td>
//                               <div className="d-flex align-items-center file-name-icon">
//                                 <Link to="#" className="avatar avatar-md">
//                                   <img src={customer17} className="img-fluid" alt="img" />
//                                 </Link>
//                                 <div className="ms-2">
//                                   <h6 className="fw-medium">
//                                     <Link to="#">Timothy Sandsr</Link>
//                                   </h6>
//                                   <span className="fs-13 text-orange">#114589</span>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>
//                               <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Completed
//                               </span>
//                             </td>
//                             <td className="fs-16 fw-bold text-gray-9">$3,569</td>
//                           </tr>
//                           <tr>
//                             <td>22 May 2025</td>
//                             <td>
//                               <div className="d-flex align-items-center file-name-icon">
//                                 <Link to="#" className="avatar avatar-md">
//                                   <img src={customer18} className="img-fluid" alt="img" />
//                                 </Link>
//                                 <div className="ms-2">
//                                   <h6 className="fw-medium">
//                                     <Link to="#">Bonnie Rodrigues</Link>
//                                   </h6>
//                                   <span className="fs-13 text-orange">#114589</span>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>
//                               <span className="badge badge-pink badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Draft
//                               </span>
//                             </td>
//                             <td className="fs-16 fw-bold text-gray-9">$4,560</td>
//                           </tr>
//                           <tr>
//                             <td>21 May 2025</td>
//                             <td>
//                               <div className="d-flex align-items-center file-name-icon">
//                                 <Link to="#" className="avatar avatar-md">
//                                   <img src={customer15} className="img-fluid" alt="img" />
//                                 </Link>
//                                 <div className="ms-2">
//                                   <h6 className="fw-medium">
//                                     <Link to="#">Randy McCree</Link>
//                                   </h6>
//                                   <span className="fs-13 text-orange">#114589</span>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>
//                               <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Completed
//                               </span>
//                             </td>
//                             <td className="fs-16 fw-bold text-gray-9">$2,155</td>
//                           </tr>
//                           <tr>
//                             <td>21 May 2025</td>
//                             <td>
//                               <div className="d-flex align-items-center file-name-icon">
//                                 <Link to="#" className="avatar avatar-md">
//                                   <img src={customer13} className="img-fluid" alt="img" />
//                                 </Link>
//                                 <div className="ms-2">
//                                   <h6 className="fw-medium">
//                                     <Link to="#">Dennis Anderson</Link>
//                                   </h6>
//                                   <span className="fs-13 text-orange">#114589</span>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>
//                               <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Completed
//                               </span>
//                             </td>
//                             <td className="fs-16 fw-bold text-gray-9">$5,123</td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                   <div className="tab-pane fade" id="purchase-transaction">
//                     <div className="table-responsive">
//                       <table className="table table-borderless custom-table">
//                         <thead className="thead-light">
//                           <tr>
//                             <th>Date</th>
//                             <th>Supplier</th>
//                             <th>Status</th>
//                             <th>Total</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           <tr>
//                             <td>24 May 2025</td>
//                             <td>
//                               <Link to="#" className="fw-semibold">
//                                 Electro Mart
//                               </Link>
//                             </td>
//                             <td>
//                               <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Completed
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$1000</td>
//                           </tr>
//                           <tr>
//                             <td>23 May 2025</td>
//                             <td>
//                               <Link to="#" className="fw-semibold">
//                                 Quantum Gadgets
//                               </Link>
//                             </td>
//                             <td>
//                               <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Completed
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$1500</td>
//                           </tr>
//                           <tr>
//                             <td>22 May 2025</td>
//                             <td>
//                               <Link to="#" className="fw-semibold">
//                                 Prime Bazaar
//                               </Link>
//                             </td>
//                             <td>
//                               <span className="badge badge-cyan badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Pending
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$2000</td>
//                           </tr>
//                           <tr>
//                             <td>21 May 2025</td>
//                             <td>
//                               <Link to="#" className="fw-semibold">
//                                 Alpha Mobiles
//                               </Link>
//                             </td>
//                             <td>
//                               <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Completed
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$1200</td>
//                           </tr>
//                           <tr>
//                             <td>21 May 2025</td>
//                             <td>
//                               <Link to="#" className="fw-semibold">
//                                 Aesthetic Bags
//                               </Link>
//                             </td>
//                             <td>
//                               <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Completed
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$1300</td>
//                           </tr>
//                           <tr>
//                             <td>28 May 2025</td>
//                             <td>
//                               <Link to="#" className="fw-semibold">
//                                 Sigma Chairs
//                               </Link>
//                             </td>
//                             <td>
//                               <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Completed
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$1600</td>
//                           </tr>
//                           <tr>
//                             <td>26 May 2025</td>
//                             <td>
//                               <Link to="#" className="fw-semibold">
//                                 A-Z Store s
//                               </Link>
//                             </td>
//                             <td>
//                               <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Completed
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$1100</td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                   <div className="tab-pane" id="quotation">
//                     <div className="table-responsive">
//                       <table className="table table-borderless custom-table">
//                         <thead className="thead-light">
//                           <tr>
//                             <th>Date</th>
//                             <th>Customer</th>
//                             <th>Status</th>
//                             <th>Total</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           <tr>
//                             <td>24 May 2025</td>
//                             <td>
//                               <div className="d-flex align-items-center file-name-icon">
//                                 <Link to="#" className="avatar avatar-md">
//                                   <img src={customer16} className="img-fluid" alt="img" />
//                                 </Link>
//                                 <div className="ms-2">
//                                   <h6 className="fw-medium">
//                                     <Link to="#">Andrea Willer</Link>
//                                   </h6>
//                                   <span className="fs-13 text-orange">#114589</span>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>
//                               <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Sent
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$4,560</td>
//                           </tr>
//                           <tr>
//                             <td>23 May 2025</td>
//                             <td>
//                               <div className="d-flex align-items-center file-name-icon">
//                                 <Link to="#" className="avatar avatar-md">
//                                   <img src={customer17} className="img-fluid" alt="img" />
//                                 </Link>
//                                 <div className="ms-2">
//                                   <h6 className="fw-medium">
//                                     <Link to="#">Timothy Sandsr</Link>
//                                   </h6>
//                                   <span className="fs-13 text-orange">#114589</span>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>
//                               <span className="badge badge-warning badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Ordered
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$3,569</td>
//                           </tr>
//                           <tr>
//                             <td>22 May 2025</td>
//                             <td>
//                               <div className="d-flex align-items-center file-name-icon">
//                                 <Link to="#" className="avatar avatar-md">
//                                   <img src={customer18} className="img-fluid" alt="img" />
//                                 </Link>
//                                 <div className="ms-2">
//                                   <h6 className="fw-medium">
//                                     <Link to="#">Bonnie Rodrigues</Link>
//                                   </h6>
//                                   <span className="fs-13 text-orange">#114589</span>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>
//                               <span className="badge badge-cyan badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Pending
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$4,560</td>
//                           </tr>
//                           <tr>
//                             <td>21 May 2025</td>
//                             <td>
//                               <div className="d-flex align-items-center file-name-icon">
//                                 <Link to="#" className="avatar avatar-md">
//                                   <img src={customer15} className="img-fluid" alt="img" />
//                                 </Link>
//                                 <div className="ms-2">
//                                   <h6 className="fw-medium">
//                                     <Link to="#">Randy McCree</Link>
//                                   </h6>
//                                   <span className="fs-13 text-orange">#114589</span>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>
//                               <span className="badge badge-warning badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Ordered
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$2,155</td>
//                           </tr>
//                           <tr>
//                             <td>21 May 2025</td>
//                             <td>
//                               <div className="d-flex align-items-center file-name-icon">
//                                 <Link to="#" className="avatar avatar-md">
//                                   <img src={customer13} className="img-fluid" alt="img" />
//                                 </Link>
//                                 <div className="ms-2">
//                                   <h6 className="fw-medium">
//                                     <Link to="#">Dennis Anderson</Link>
//                                   </h6>
//                                   <span className="fs-13 text-orange">#114589</span>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>
//                               <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Sent
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$5,123</td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                   <div className="tab-pane fade" id="expenses">
//                     <div className="table-responsive">
//                       <table className="table table-borderless custom-table">
//                         <thead className="thead-light">
//                           <tr>
//                             <th>Date</th>
//                             <th>Expenses</th>
//                             <th>Status</th>
//                             <th>Total</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           <tr>
//                             <td>24 May 2025</td>
//                             <td>
//                               <h6 className="fw-medium">
//                                 <Link to="#">Electricity Payment</Link>
//                               </h6>
//                               <span className="fs-13 text-orange">#EX849</span>
//                             </td>
//                             <td>
//                               <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Approved
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$200</td>
//                           </tr>
//                           <tr>
//                             <td>23 May 2025</td>
//                             <td>
//                               <h6 className="fw-medium">
//                                 <Link to="#">Electricity Payment</Link>
//                               </h6>
//                               <span className="fs-13 text-orange">#EX849</span>
//                             </td>
//                             <td>
//                               <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Approved
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$200</td>
//                           </tr>
//                           <tr>
//                             <td>22 May 2025</td>
//                             <td>
//                               <h6 className="fw-medium">
//                                 <Link to="#">Stationery Purchase</Link>
//                               </h6>
//                               <span className="fs-13 text-orange">#EX848</span>
//                             </td>
//                             <td>
//                               <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Approved
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$50</td>
//                           </tr>
//                           <tr>
//                             <td>21 May 2025</td>
//                             <td>
//                               <h6 className="fw-medium">
//                                 <Link to="#">AC Repair Service</Link>
//                               </h6>
//                               <span className="fs-13 text-orange">#EX847</span>
//                             </td>
//                             <td>
//                               <span className="badge badge-cyan badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Pending
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$800</td>
//                           </tr>
//                           <tr>
//                             <td>21 May 2025</td>
//                             <td>
//                               <h6 className="fw-medium">
//                                 <Link to="#">Client Meeting</Link>
//                               </h6>
//                               <span className="fs-13 text-orange">#EX846</span>
//                             </td>
//                             <td>
//                               <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Approved
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$100</td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                   <div className="tab-pane" id="invoices">
//                     <div className="table-responsive">
//                       <table className="table table-borderless custom-table">
//                         <thead className="thead-light">
//                           <tr>
//                             <th>Customer</th>
//                             <th>Due Date</th>
//                             <th>Status</th>
//                             <th>Amount</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           <tr>
//                             <td>
//                               <div className="d-flex align-items-center file-name-icon">
//                                 <Link to="#" className="avatar avatar-md">
//                                   <img src={customer16} className="img-fluid" alt="img" />
//                                 </Link>
//                                 <div className="ms-2">
//                                   <h6 className="fw-medium">
//                                     <Link to="#">Andrea Willer</Link>
//                                   </h6>
//                                   <span className="fs-13 text-orange">#INV005</span>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>24 May 2025</td>
//                             <td>
//                               <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Paid
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$1300</td>
//                           </tr>
//                           <tr>
//                             <td>
//                               <div className="d-flex align-items-center file-name-icon">
//                                 <Link to="#" className="avatar avatar-md">
//                                   <img src={customer17} className="img-fluid" alt="img" />
//                                 </Link>
//                                 <div className="ms-2">
//                                   <h6 className="fw-medium">
//                                     <Link to="#">Timothy Sandsr</Link>
//                                   </h6>
//                                   <span className="fs-13 text-orange">#INV004</span>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>23 May 2025</td>
//                             <td>
//                               <span className="badge badge-warning badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Overdue
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$1250</td>
//                           </tr>
//                           <tr>
//                             <td>
//                               <div className="d-flex align-items-center file-name-icon">
//                                 <Link to="#" className="avatar avatar-md">
//                                   <img src={customer18} className="img-fluid" alt="img" />
//                                 </Link>
//                                 <div className="ms-2">
//                                   <h6 className="fw-medium">
//                                     <Link to="#">Bonnie Rodrigues</Link>
//                                   </h6>
//                                   <span className="fs-13 text-orange">#INV003</span>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>22 May 2025</td>
//                             <td>
//                               <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Paid
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$1700</td>
//                           </tr>
//                           <tr>
//                             <td>
//                               <div className="d-flex align-items-center file-name-icon">
//                                 <Link to="#" className="avatar avatar-md">
//                                   <img src={customer15} className="img-fluid" alt="img" />
//                                 </Link>
//                                 <div className="ms-2">
//                                   <h6 className="fw-medium">
//                                     <Link to="#">Randy McCree</Link>
//                                   </h6>
//                                   <span className="fs-13 text-orange">#INV002</span>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>21 May 2025</td>
//                             <td>
//                               <span className="badge badge-danger badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Unpaid
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$1500</td>
//                           </tr>
//                           <tr>
//                             <td>
//                               <div className="d-flex align-items-center file-name-icon">
//                                 <Link to="#" className="avatar avatar-md">
//                                   <img src={customer13} className="img-fluid" alt="img" />
//                                 </Link>
//                                 <div className="ms-2">
//                                   <h6 className="fw-medium">
//                                     <Link to="#">Dennis Anderson</Link>
//                                   </h6>
//                                   <span className="fs-13 text-orange">#INV001</span>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>21 May 2025</td>
//                             <td>
//                               <span className="badge badge-success badge-xs d-inline-flex align-items-center">
//                                 <i className="ti ti-circle-filled fs-5 me-1" />
//                                 Paid
//                               </span>
//                             </td>
//                             <td className="text-gray-9">$1000</td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* /Recent Transactions */}
//         </div>
//         <div className="row">
//           {/* Top Customers */}
//           <div className="col-xxl-4 col-md-6 d-flex">
//             <div className="card flex-fill">
//               <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
//                 <div className="d-inline-flex align-items-center">
//                   <span className="title-icon bg-soft-orange fs-16 me-2">
//                     <i className="ti ti-users" />
//                   </span>
//                   <h5 className="card-title mb-0">Top Customers</h5>
//                 </div>
//                 <Link to={route.customer} className="fs-13 fw-medium text-decoration-underline">
//                   View All
//                 </Link>
//               </div>
//               <div className="card-body">
//                 <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3 flex-wrap gap-2">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg flex-shrink-0">
//                       <img src={customer11} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fs-14 fw-bold mb-1">
//                         <Link to="#">Carlos Curran</Link>
//                       </h6>
//                       <div className="d-flex align-items-center item-list">
//                         <p className="d-inline-flex align-items-center">
//                           <i className="ti ti-map-pin me-1" />
//                           USA
//                         </p>
//                         <p>24 Orders</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-end">
//                     <h5>$8,9645</h5>
//                   </div>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3 flex-wrap gap-2">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg flex-shrink-0">
//                       <img src={customer12} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fs-14 fw-bold mb-1">
//                         <Link to="#">Stan Gaunter</Link>
//                       </h6>
//                       <div className="d-flex align-items-center item-list">
//                         <p className="d-inline-flex align-items-center">
//                           <i className="ti ti-map-pin me-1" />
//                           UAE
//                         </p>
//                         <p>22 Orders</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-end">
//                     <h5>$16,985</h5>
//                   </div>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3 flex-wrap gap-2">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg flex-shrink-0">
//                       <img src={customer13} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fs-14 fw-bold mb-1">
//                         <Link to="#">Richard Wilson</Link>
//                       </h6>
//                       <div className="d-flex align-items-center item-list">
//                         <p className="d-inline-flex align-items-center">
//                           <i className="ti ti-map-pin me-1" />
//                           Germany
//                         </p>
//                         <p>14 Orders</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-end">
//                     <h5>$5,366</h5>
//                   </div>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3 flex-wrap gap-2">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg flex-shrink-0">
//                       <img src={customer14} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fs-14 fw-bold mb-1">
//                         <Link to="#">Mary Bronson</Link>
//                       </h6>
//                       <div className="d-flex align-items-center item-list">
//                         <p className="d-inline-flex align-items-center">
//                           <i className="ti ti-map-pin me-1" />
//                           Belgium
//                         </p>
//                         <p>08 Orders</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-end">
//                     <h5>$4,569</h5>
//                   </div>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
//                   <div className="d-flex align-items-center">
//                     <Link to="#" className="avatar avatar-lg flex-shrink-0">
//                       <img src={customer15} alt="img" />
//                     </Link>
//                     <div className="ms-2">
//                       <h6 className="fs-14 fw-bold mb-1">
//                         <Link to="#">Annie Tremblay</Link>
//                       </h6>
//                       <div className="d-flex align-items-center item-list">
//                         <p className="d-inline-flex align-items-center">
//                           <i className="ti ti-map-pin me-1" />
//                           Greenland
//                         </p>
//                         <p>14 Orders</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-end">
//                     <h5>$3,5698</h5>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* /Top Customers */}
//           {/* Top Categories */}
//           <div className="col-xxl-4 col-md-6 d-flex">
//             <div className="card flex-fill">
//               <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
//                 <div className="d-inline-flex align-items-center">
//                   <span className="title-icon bg-soft-orange fs-16 me-2">
//                     <i className="ti ti-users" />
//                   </span>
//                   <h5 className="card-title mb-0">Top Categories</h5>
//                 </div>
//                 <div className="dropdown">
//                   <Link
//                     to="#"
//                     className="dropdown-toggle btn btn-sm btn-white d-flex align-items-center"
//                     data-bs-toggle="dropdown"
//                     aria-expanded="false"
//                   >
//                     <i className="ti ti-calendar me-1" />
//                     Weekly
//                   </Link>
//                   <ul className="dropdown-menu p-3">
//                     <li>
//                       <Link to="#" className="dropdown-item">
//                         Today
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item">
//                         Weekly
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item">
//                         Monthly
//                       </Link>
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//               <div className="card-body">
//                 <div className="d-flex align-items-center justify-content-between flex-wrap gap-4 mb-4">
//                   <div>
//                     <Doughnut
//                       data={data}
//                       options={option}
//                       style={{
//                         boxSizing: 'border-box',
//                         height: '230px',
//                         width: '200px'
//                       }}
//                     />
//                   </div>
//                   <div>
//                     <div className="category-item category-primary">
//                       <p className="fs-13 mb-1">Electronics</p>
//                       <h2 className="d-flex align-items-center">
//                         698
//                         <span className="fs-13 fw-normal text-default ms-1">Sales</span>
//                       </h2>
//                     </div>
//                     <div className="category-item category-orange">
//                       <p className="fs-13 mb-1">Sports</p>
//                       <h2 className="d-flex align-items-center">
//                         545
//                         <span className="fs-13 fw-normal text-default ms-1">Sales</span>
//                       </h2>
//                     </div>
//                     <div className="category-item category-secondary">
//                       <p className="fs-13 mb-1">Lifestyles</p>
//                       <h2 className="d-flex align-items-center">
//                         456
//                         <span className="fs-13 fw-normal text-default ms-1">Sales</span>
//                       </h2>
//                     </div>
//                   </div>
//                 </div>
//                 <h6 className="mb-2">Category Statistics</h6>
//                 <div className="border br-8">
//                   <div className="d-flex align-items-center justify-content-between border-bottom p-2">
//                     <p className="d-inline-flex align-items-center mb-0">
//                       <i className="ti ti-square-rounded-filled text-indigo fs-8 me-2" />
//                       Total Number Of Categories
//                     </p>
//                     <h5>698</h5>
//                   </div>
//                   <div className="d-flex align-items-center justify-content-between p-2">
//                     <p className="d-inline-flex align-items-center mb-0">
//                       <i className="ti ti-square-rounded-filled text-orange fs-8 me-2" />
//                       Total Number Of Products
//                     </p>
//                     <h5>7899</h5>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* /Top Categories */}
//           {/* Order Statistics */}
//           <div className="col-xxl-4 col-md-12 d-flex">
//             <div className="card flex-fill">
//               <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
//                 <div className="d-inline-flex align-items-center">
//                   <span className="title-icon bg-soft-indigo fs-16 me-2">
//                     <i className="ti ti-package" />
//                   </span>
//                   <h5 className="card-title mb-0">Order Statistics</h5>
//                 </div>
//                 <div className="dropdown">
//                   <Link to="#" className="dropdown-toggle btn btn-sm btn-white" data-bs-toggle="dropdown" aria-expanded="false">
//                     <i className="ti ti-calendar me-1" />
//                     Weekly
//                   </Link>
//                   <ul className="dropdown-menu p-3">
//                     <li>
//                       <Link to="#" className="dropdown-item">
//                         Today
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item">
//                         Weekly
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item">
//                         Monthly
//                       </Link>
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//               <div className="card-body pb-0">
//                 <div id="heat_chart">
//                   <ApexCharts options={heat_chart} series={heat_chart.series} type="heatmap" height={370} />
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* /Order Statistics */}
//         </div>
//       </div>
//       <div className="copyright-footer d-flex align-items-center justify-content-between border-top bg-white gap-3 flex-wrap">
//         <p className="fs-13 text-gray-9 mb-0">2014-2025 © DreamsPOS. All Right Reserved</p>
//         <p>
//           Designed &amp; Developed By Dreams{' '}
//           <Link to="#" className="link-primary">
//             Dreams
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default NewDashboard;
