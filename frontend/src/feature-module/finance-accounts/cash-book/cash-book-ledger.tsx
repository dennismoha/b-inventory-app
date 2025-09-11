import { useMemo, useState, useEffect } from 'react';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { Box, Stack } from '@mui/material';
import { useGetCashBookRecordsQuery } from '@core/redux/api/inventory-api';
import type { CashBookLedgerEntry } from '@features/interface/features-interface';

type ISODate = string | Date;

type LedgerRow = {
  sessionId: string;
  status: string;
  openingDate: ISODate;
  closingDate: ISODate | null;
  // openingBalance: number;
  closingBalance?: string;
  totalForAccounts?: string;
  type: 'DEBIT' | 'CREDIT';
  account?: string;
  method: string;
  amount: number;
  date: ISODate;
};

const CashbookLedgerMRT = () => {
  const [ledgerData, setLedgerData] = useState<LedgerRow[]>([]);
  const { data: session } = useGetCashBookRecordsQuery();

  const sessions = session?.data ?? [];

  useEffect(() => {
    // Flatten inflows/outflows
    const flattened: LedgerRow[] = sessions.flatMap((s) => {
      const inflows =
        s.cashBookLedgers.inflows?.map((tx: CashBookLedgerEntry) => ({
          sessionId: s.pos_session_id,
          status: s.status,
          openingDate: s.opening_date,
          closingDate: s.closing_date,
          // openingBalance: s.opening_balance,
          closingBalance: s.closing_balance,
          totalForAccounts: s.total_for_accounts,
          type: 'DEBIT' as const,
          account: tx.account_name,
          method: tx.method,
          amount: tx.amount,
          date: tx.transaction_date
        })) || [];

      const outflows =
        s.cashBookLedgers.outflows?.map((tx: CashBookLedgerEntry) => ({
          sessionId: s.pos_session_id,
          status: s.status,
          openingDate: s.opening_date,
          closingDate: s.closing_date,
          // openingBalance: s.opening_balance,
          closingBalance: s.closing_balance,
          totalForAccounts: s.total_for_accounts,
          type: 'CREDIT' as const,
          account: tx.account_name,
          method: tx.method,
          amount: tx.amount,
          date: tx.transaction_date
        })) || [];

      return [...inflows, ...outflows];
    });

    setLedgerData(flattened);
  }, [session]);

  const totalAmount = useMemo(() => ledgerData.reduce((acc, row) => acc + row.amount, 0), [ledgerData]);

  const columns = useMemo<MRT_ColumnDef<LedgerRow>[]>(
    () => [
      {
        header: 'Date',
        accessorKey: 'date'
      },
      {
        header: 'Type',
        accessorKey: 'type',
        aggregationFn: 'count',
        GroupedCell: ({ cell, row }) => (
          <Box sx={{ color: cell.getValue() === 'DEBIT' ? 'green' : 'red' }}>
            <strong>{String(cell.getValue())}s</strong> ({row.subRows?.length})
          </Box>
        )
      },
      {
        header: 'Account',
        accessorKey: 'account'
      },
      {
        header: 'Method',
        accessorKey: 'method'
      },
      {
        header: 'Amount',
        accessorKey: 'amount',
        aggregationFn: 'sum',
        Cell: ({ cell }) => <Box sx={{ fontWeight: 'bold' }}>{Number(cell.getValue()).toLocaleString()}</Box>,
        AggregatedCell: ({ cell }) => (
          <Box sx={{ color: 'primary.main', fontWeight: 'bold' }}>Total: {Number(cell.getValue()).toLocaleString()}</Box>
        ),
        Footer: () => (
          <Stack>
            Grand Total:
            <Box color="warning.main">{totalAmount.toLocaleString()}</Box>
          </Stack>
        )
      },
      {
        header: 'Session ID',
        accessorKey: 'sessionId',
        // Custom group header for session-level info
        GroupedCell: ({ row }) => {
          const { original } = row.subRows?.[0] ?? {}; // pick first child row
          if (!original) return null;
          return (
            <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 2 }}>
              <strong>Session:</strong> {original.sessionId} ({original.status})
              <br />
              <strong>Opening:</strong> {new Date(original.openingDate).toLocaleString()}
              <br />
              <strong>Closing:</strong> {original.closingDate ? new Date(original.closingDate).toLocaleString() : '—'}
              <br />
              {/* <strong>Opening Balance:</strong> {original. openingBalance.toLocaleString()} */}
              <br />
              <strong>Closing Balance:</strong> {original.closingBalance?.toLocaleString() ?? 'no closing yet'}
              <br />
              <strong>Total for Accounts:</strong> {original.totalForAccounts?.toLocaleString() ?? 'no total yet'}
            </Box>
          );
        }
      }
    ],
    [totalAmount]
  );

  const table = useMaterialReactTable({
    columns,
    data: ledgerData,
    enableGrouping: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    initialState: {
      density: 'compact',
      expanded: true,
      grouping: ['sessionId', 'type'], // group by session → type
      pagination: { pageIndex: 0, pageSize: 20 }
    },
    muiTableContainerProps: { sx: { maxHeight: 600 } }
  });

  return (
    <div className="page-wrapper">
      <div className="content">
        <h3>Cashbook Ledger</h3>
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
};

export default CashbookLedgerMRT;

// import { useMemo, useState, useEffect } from 'react';
// import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
// import { Box, Stack } from '@mui/material';

// type LedgerRow = {
//   sessionId: string;
//   status: string;
//   openingDate: string;
//   closingDate: string | null;
//   type: 'DEBIT' | 'CREDIT';
//   account: string;
//   method: string;
//   amount: number;
//   date: string;
// };

// const CashbookLedgerMRT = () => {
//   const [ledgerData, setLedgerData] = useState<LedgerRow[]>([]);

//   useEffect(() => {
//     // Mock sessions data (replace with API)
//     const sessions = [
//       {
//         pos_session_id: '4163097a',
//         opening_date: '2025-08-15T19:31:29.239Z',
//         closing_date: '2025-08-20T13:22:24.898Z',
//         status: 'CLOSED',
//         cashBookLedgers: {
//           inflows: [],
//           outflows: [
//             {
//               transaction_date: '2025-08-18T02:44:53.934Z',
//               transaction_type: 'OUTFLOW',
//               amount: 6000,
//               method: 'bank',
//               account_name: 'Kcb'
//             }
//           ]
//         }
//       },
//       {
//         pos_session_id: 'c8133a83',
//         opening_date: '2025-08-20T13:22:36.980Z',
//         closing_date: null,
//         status: 'PREV',
//         cashBookLedgers: {
//           inflows: [],
//           outflows: [
//             {
//               transaction_date: '2025-08-20T20:32:33.940Z',
//               transaction_type: 'OUTFLOW',
//               amount: 100,
//               method: 'bank',
//               account_name: 'family bank'
//             },
//             {
//               transaction_date: '2025-08-21T06:03:19.969Z',
//               transaction_type: 'OUTFLOW',
//               amount: 2200,
//               method: 'bank',
//               account_name: 'family bank'
//             }
//           ]
//         }
//       }
//     ];

//     // Flatten inflows/outflows
//     const flattened: LedgerRow[] = sessions.flatMap((s) => {
//       const inflows =
//         (s.cashBookLedgers as any)?.inflows?.map((tx: any) => ({
//           sessionId: s.pos_session_id,
//           status: s.status,
//           openingDate: s.opening_date,
//           closingDate: s.closing_date,
//           type: 'DEBIT' as const,
//           account: tx.account_name,
//           method: tx.method,
//           amount: tx.amount,
//           date: tx.transaction_date
//         })) || [];

//       const outflows =
//         (s.cashBookLedgers as any)?.outflows?.map((tx: any) => ({
//           sessionId: s.pos_session_id,
//           status: s.status,
//           openingDate: s.opening_date,
//           closingDate: s.closing_date,
//           type: 'CREDIT' as const,
//           account: tx.account_name,
//           method: tx.method,
//           amount: tx.amount,
//           date: tx.transaction_date
//         })) || [];

//       return [...inflows, ...outflows];
//     });

//     setLedgerData(flattened);
//   }, []);

//   // Precompute overall totals
//   const totalAmount = useMemo(() => ledgerData.reduce((acc, row) => acc + row.amount, 0), [ledgerData]);

//   const columns = useMemo<MRT_ColumnDef<LedgerRow>[]>(
//     () => [
//       {
//         header: 'Date',
//         accessorKey: 'date'
//       },
//       {
//         header: 'Type',
//         accessorKey: 'type',
//         aggregationFn: 'count',
//         GroupedCell: ({ cell, row }) => (
//           <Box sx={{ color: cell.getValue() === 'DEBIT' ? 'green' : 'red' }}>
//             <strong>{cell.getValue()}s</strong> ({row.subRows?.length})
//           </Box>
//         )
//       },
//       {
//         header: 'Account',
//         accessorKey: 'account'
//       },
//       {
//         header: 'Method',
//         accessorKey: 'method'
//       },
//       {
//         header: 'Amount',
//         accessorKey: 'amount',
//         aggregationFn: 'sum',
//         Cell: ({ cell }) => <Box sx={{ fontWeight: 'bold' }}>{Number(cell.getValue()).toLocaleString()}</Box>,
//         AggregatedCell: ({ cell }) => (
//           <Box sx={{ color: 'primary.main', fontWeight: 'bold' }}>Total: {Number(cell.getValue()).toLocaleString()}</Box>
//         ),
//         Footer: () => (
//           <Stack>
//             Grand Total:
//             <Box color="warning.main">{totalAmount.toLocaleString()}</Box>
//           </Stack>
//         )
//       },
//       {
//         header: 'Session ID',
//         accessorKey: 'sessionId'
//       },
//       {
//         header: 'Session Status',
//         accessorKey: 'status'
//       }
//     ],
//     [totalAmount]
//   );

//   const table = useMaterialReactTable({
//     columns,
//     data: ledgerData,
//     enableGrouping: true,
//     enableStickyHeader: true,
//     enableStickyFooter: true,
//     initialState: {
//       density: 'compact',
//       expanded: true,
//       grouping: ['sessionId', 'type'], // Group by session → type
//       pagination: { pageIndex: 0, pageSize: 20 }
//     },
//     muiTableContainerProps: { sx: { maxHeight: 600 } }
//   });

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <h3>Cashbook Ledger</h3>
//         <MaterialReactTable table={table} />
//       </div>
//     </div>
//   );
// };

// export default CashbookLedgerMRT;
