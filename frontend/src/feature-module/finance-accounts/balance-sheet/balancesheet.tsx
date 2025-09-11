import { useState, useMemo } from 'react';
import { DataTable, type DataTableExpandedRows, type DataTableValueArray } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useGetBalanceSheetQuery } from '@core/redux/api/inventory-api';
import type { Account } from '@features/interface/features-interface';
import CommonFooter from '@components/footer/commonFooter';

interface CategoryRow {
  id: string;
  category: 'Assets' | 'Liabilities' | 'Equity';
  accounts: Account[];
  total: number;
}

const BalanceSheet = () => {
  const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expandedRows, setExpandedRows] = useState<DataTableValueArray[] | DataTableExpandedRows | undefined>();
  console.log('expandedRows', expandedRows);

  const { data, isLoading } = useGetBalanceSheetQuery({ asOfDate });

  const categories: CategoryRow[] = useMemo(() => {
    if (!data) return [];
    return [
      { id: 'assets', category: 'Assets', accounts: data.data.assets, total: data.data.totals.totalAssets },
      { id: 'liabilities', category: 'Liabilities', accounts: data.data.liabilities, total: data.data.totals.totalLiabilities },
      { id: 'equity', category: 'Equity', accounts: data.data.equity, total: data.data.totals.totalEquity }
    ];
  }, [data]);

  const rowExpansionTemplate = (row: CategoryRow) => {
    return (
      <div className="p-3">
        <h6 className="fw-bold mb-3">{row.category}</h6>
        <DataTable value={row.accounts} responsiveLayout="scroll">
          <Column field="name" header="Account Name" />
          <Column field="account_number" header="Account Number" />

          {/* Debit column */}
          <Column
            header="Debit"
            body={(account: Account) => {
              const debit = account.journalLines?.reduce((sum, jl) => sum + Number(jl.debit), 0) ?? 0;
              return debit.toLocaleString();
            }}
          />

          {/* Credit column */}
          <Column
            header="Credit"
            body={(account: Account) => {
              const credit = account.journalLines?.reduce((sum, jl) => sum + Number(jl.credit), 0) ?? 0;
              return credit.toLocaleString();
            }}
          />
        </DataTable>

        {/* Category total */}
        <div className="mt-2 fw-bold">
          Total {row.category}: {row.total.toLocaleString()}
        </div>
      </div>
    );
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header d-flex justify-content-between align-items-center flex-wrap">
          <div className="page-title">
            <h4 className="fw-bold">Balance Sheet</h4>
            <h6>As of {asOfDate}</h6>
          </div>
          <div className="d-flex align-items-center gap-2">
            <label className="fw-bold">As of Date:</label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="form-control"
              style={{ width: '200px' }}
            />
          </div>
        </div>

        <div className="card table-list-card mt-3">
          <div className="card-body">
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <DataTable
                value={categories}
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data)}
                rowExpansionTemplate={rowExpansionTemplate}
                dataKey="id"
                responsiveLayout="scroll"
              >
                <Column expander style={{ width: '3rem' }} />
                <Column field="category" header="Category" />
                <Column header="Category Total" body={(row: CategoryRow) => row.total.toLocaleString()} />
              </DataTable>
            )}
          </div>
        </div>
      </div>
      <CommonFooter />
    </div>
  );
};

export default BalanceSheet;

// interface CategoryRow {
//   id: string;
//   category: 'Assets' | 'Liabilities' | 'Equity';
//   accounts: Account[];
// }

// const BalanceSheet = () => {
//   const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split('T')[0]);
//   const [expandedRows, setExpandedRows] = useState<any>(null);

//   const { data, isLoading } = useGetBalanceSheetQuery({ asOfDate });

//   // Transform API data into parent rows
//   const categories: CategoryRow[] = useMemo(() => {
//     if (!data) return [];
//     return [
//       { id: 'assets', category: 'Assets', accounts: data.data.assets },
//       { id: 'liabilities', category: 'Liabilities', accounts: data.data.liabilities },
//       { id: 'equity', category: 'Equity', accounts: data.data.equity }
//     ];
//   }, [data]);

//   const rowExpansionTemplate = (row: CategoryRow) => {
//     return (
//       <div className="p-3">
//         <h6 className="fw-bold mb-3">{row.category}</h6>
//         <DataTable value={row.accounts} responsiveLayout="scroll">
//           <Column field="name" header="Account Name" sortable />
//           <Column field="account_number" header="Account Number" sortable />
//           <Column field="opening_balance" header="Opening Balance" sortable />
//           <Column field="running_balance" header="Running Balance" sortable />
//           <Column field="account_status" header="Status" sortable />
//         </DataTable>
//       </div>
//     );
//   };

//   const header = (
//     <div className="flex flex-wrap justify-content-end gap-2">
//       <button
//         className="btn btn-sm btn-outline-primary"
//         onClick={() => {
//           const _expandedRows: Record<string, boolean> = {};
//           categories.forEach((c) => (_expandedRows[c.id] = true));
//           setExpandedRows(_expandedRows);
//         }}
//       >
//         Expand All
//       </button>
//       <button className="btn btn-sm btn-outline-secondary" onClick={() => setExpandedRows(null)}>
//         Collapse All
//       </button>
//     </div>
//   );

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="page-header d-flex justify-content-between align-items-center flex-wrap">
//           <div className="page-title">
//             <h4 className="fw-bold">Balance Sheet</h4>
//             <h6>As of {asOfDate}</h6>
//           </div>
//           <div className="d-flex align-items-center gap-2">
//             <label className="fw-bold">As of Date:</label>
//             <input
//               type="date"
//               value={asOfDate}
//               onChange={(e) => setAsOfDate(e.target.value)}
//               className="form-control"
//               style={{ width: '200px' }}
//             />
//           </div>
//         </div>

//         <div className="card table-list-card mt-3">
//           <div className="card-body">
//             {isLoading ? (
//               <p>Loading...</p>
//             ) : (
//               <>
//                 <DataTable
//                   value={categories}
//                   expandedRows={expandedRows}
//                   onRowToggle={(e) => setExpandedRows(e.data)}
//                   rowExpansionTemplate={rowExpansionTemplate}
//                   dataKey="id"
//                   header={header}
//                   responsiveLayout="scroll"
//                 >
//                   <Column expander style={{ width: '3rem' }} />
//                   <Column field="category" header="Category" />
//                   <Column header="Number of Accounts" body={(row: CategoryRow) => row.accounts.length} />
//                 </DataTable>

//                 {/* Totals */}
//                 {data && (
//                   <div className="mt-4">
//                     <h6 className="fw-bold">Totals</h6>
//                     <ul>
//                       <li>Total Assets: {data.data.totals.totalAssets}</li>
//                       <li>Total Liabilities: {data.data.totals.totalLiabilities}</li>
//                       <li>Total Equity: {data.data.totals.totalEquity}</li>
//                     </ul>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//       <CommonFooter />
//     </div>
//   );
// };

// export default BalanceSheet;

// import { useMemo, useState } from 'react';
// import { useGetBalanceSheetQuery } from '@core/redux/api/inventory-api';
// // import type { BalanceSheetResponse, Account } from '@/types';
// import CommonFooter from '../../../components/footer/commonFooter';
// import type { Account, BalanceSheetResponse } from '@features/interface/features-interface';
// import PrimeDataTable from '../../../components/data-table';

// interface BalanceSheetRow extends Account {
//   category: 'Assets' | 'Liabilities' | 'Equity';
// }

// // function transformBalanceSheet(data: BalanceSheetResponse): BalanceSheetRow[] {
// //   if (!data) return [];
// //   const wrap = (accs: Account[], category: BalanceSheetRow['category']) => accs.map((a) => ({ category, account: a }));
// //   return [...wrap(data.assets, 'Assets'), ...wrap(data.liabilities, 'Liabilities'), ...wrap(data.equity, 'Equity')];
// // }

// function transformBalanceSheet(data: BalanceSheetResponse): BalanceSheetRow[] {
//   if (!data) return [];
//   const wrap = (arr: Account[], category: BalanceSheetRow['category']) => arr.map((acc) => ({ ...acc, category }));
//   return [...wrap(data.assets, 'Assets'), ...wrap(data.liabilities, 'Liabilities'), ...wrap(data.equity, 'Equity')];
// }

// const BalanceSheet = () => {
//   const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split('T')[0]);

//   const { data, isLoading } = useGetBalanceSheetQuery({ asOfDate });

//   const rows: BalanceSheetRow[] = useMemo(() => (data?.data ? transformBalanceSheet(data.data) : []), [data]);

//   if (!data) {
//     return <div>no data</div>;
//   }
//   const columns = [
//     { header: 'Category', field: 'category' },
//     { header: 'Account Name', field: 'name' },
//     { header: 'Account Number', field: 'account_number' },
//     { header: 'Opening Balance', field: 'opening_balance' },
//     { header: 'Credit', field: 'credit' },
//     { header: 'Running Balance', field: 'running_balance' }
//   ];

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="page-header d-flex justify-content-between align-items-center flex-wrap">
//           <div className="page-title">
//             <h4 className="fw-bold">Balance Sheet</h4>
//             <h6>As of {asOfDate}</h6>
//           </div>

//           {/* Date Picker */}
//           <div className="d-flex align-items-center gap-2">
//             <label className="fw-bold">As of Date:</label>
//             <input
//               type="date"
//               value={asOfDate}
//               onChange={(e) => setAsOfDate(e.target.value)}
//               className="form-control"
//               style={{ width: '200px' }}
//             />
//           </div>
//         </div>

//         <div className="card table-list-card mt-3">
//           <div className="card-body">
//             {isLoading ? (
//               <p>Loading...</p>
//             ) : (
//               <>
//                 <div className="table-responsive">
//                   <PrimeDataTable
//                     column={columns}
//                     data={rows}
//                     totalRecords={rows.length}
//                     rows={10}
//                     setRows={() => {}}
//                     currentPage={1}
//                     setCurrentPage={() => {}}
//                   />
//                 </div>

//                 {/* Totals */}
//                 {data && (
//                   <div className="mt-3">
//                     <h6 className="fw-bold">Totals</h6>
//                     <ul>
//                       <li>Total Assets: {data.data.totals.totalAssets}</li>
//                       <li>Total Liabilities: {data.data.totals.totalLiabilities}</li>
//                       <li>Total Equity: {data.data.totals.totalEquity}</li>
//                     </ul>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//       <CommonFooter />
//     </div>
//   );
// };

// export default BalanceSheet;

// // import CommonFooter from '../../../components/footer/commonFooter';
// // import { Link } from 'react-router-dom';
// // import PrimeDataTable from '../../../components/data-table';

// // import { BalanceSheetData } from '../../../core/json/balancesheetData';
// // import TableTopHead from '../../../components/table-top-head';
// // import SearchFromApi from '../../../components/data-table/search';
// // import { useState } from 'react';
// // import { useGetBalanceSheetQuery } from '@core/redux/api/inventory-api';

// // const Balancesheet = () => {
// //   const {data} = useGetBalanceSheetQuery()
// //   const dataSource = BalanceSheetData;

// //   const columns = [
// //     {
// //       header: 'Name',
// //       field: 'Name'
// //     },
// //     {
// //       header: 'Bank & Account Number',
// //       field: 'Bank_Account'
// //     },
// //     {
// //       header: 'Credit',
// //       field: 'Credit'
// //     },
// //     {
// //       header: 'Debit',
// //       field: 'Debit'
// //     },
// //     {
// //       header: 'Balance',
// //       field: 'Balance'
// //     }
// //   ];
// //   const [rows, setRows] = useState<number>(10);
// //   const [_searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

// //   const handleSearch = (value: any) => {
// //     setSearchQuery(value);
// //   };
// //   return (
// //     <div className="page-wrapper">
// //       <div className="content">
// //         <div className="page-header">
// //           <div className="add-item d-flex">
// //             <div className="page-title">
// //               <h4 className="fw-bold">Balance Sheet</h4>
// //               <h6>View Your Balance Sheet </h6>
// //             </div>
// //           </div>
// //           <TableTopHead />
// //         </div>
// //         {/* /product list */}
// //         <div className="card table-list-card">
// //           <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
// //             <SearchFromApi callback={handleSearch} rows={rows} setRows={setRows} />
// //             <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
// //               <div className="dropdown">
// //                 <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
// //                   Select Store
// //                 </Link>
// //                 <ul className="dropdown-menu  dropdown-menu-end p-3">
// //                   <li>
// //                     <Link to="#" className="dropdown-item rounded-1">
// //                       Zephyr Indira
// //                     </Link>
// //                   </li>
// //                   <li>
// //                     <Link to="#" className="dropdown-item rounded-1">
// //                       Quillon Elysia
// //                     </Link>
// //                   </li>
// //                 </ul>
// //               </div>
// //             </div>
// //           </div>
// //           <div className="card-body">
// //             <div className="table-responsive">
// //               <PrimeDataTable
// //                 column={columns}
// //                 data={dataSource}
// //                 totalRecords={10}
// //                 rows={10}
// //                 setRows={() => {}}
// //                 currentPage={1}
// //                 setCurrentPage={() => {}}
// //               />{' '}
// //             </div>
// //           </div>
// //         </div>
// //         {/* /product list */}
// //       </div>
// //       <CommonFooter />
// //     </div>
// //   );
// // };

// // export default Balancesheet;
