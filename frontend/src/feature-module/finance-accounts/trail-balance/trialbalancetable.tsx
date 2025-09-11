import type { TrialBalance } from '@features/interface/features-interface';
import React from 'react';

interface TrialBalanceTableProps {
  datas: TrialBalance;
}

// type TrialBalanceItem = {
//   name: string;
//   account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
//   debit: number;
//   credit: number;
// };

// type TrialBalanceItem = Pick<TrialBalance, 'trialBalance'>;
type TrialBalanceItem = TrialBalance['trialBalance'][number];

// type TrialBalanceData = {
//   trialBalance: TrialBalanceItem[];
//   totalDebit: number;
//   totalCredit: number;
// };

const TrialBalanceTable = ({ datas }: TrialBalanceTableProps) => {
  // Group accounts by type
  const data = datas;
  const grouped = data.trialBalance.reduce(
    (acc, item) => {
      if (!acc[item.account_type]) acc[item.account_type] = [];
      acc[item.account_type].push(item);
      return acc;
    },
    {} as Record<string, TrialBalanceItem[]>
  );

  // Calculate subtotals per group
  const getSubtotals = (items: TrialBalanceItem[]) => ({
    debit: items.reduce((sum, i) => sum + i.debit, 0),
    credit: items.reduce((sum, i) => sum + i.credit, 0)
  });

  return (
    <div className="card-body">
      <div className="table-responsive">
        <table className="table datanew">
          <thead>
            <tr>
              <th>Account Name</th>
              <th>Debit</th>
              <th>Credit</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(grouped).map((group) => {
              const items = grouped[group];
              const totals = getSubtotals(items);
              return (
                <React.Fragment key={group}>
                  {/* Group header */}
                  <tr>
                    <td className="p-2 border-1 fw-bold text-gray-9">{group.charAt(0) + group.slice(1).toLowerCase()}</td>
                    <td className="p-2 border-1" />
                    <td className="p-2 border-1" />
                  </tr>

                  {/* Items */}
                  {items.map((item) => (
                    <tr key={item.name}>
                      <td className="p-2 border-1">{item.name}</td>
                      <td className="p-2 border-1">{item.debit > 0 ? `$${item.debit}` : ''}</td>
                      <td className="p-2 border-1">{item.credit > 0 ? `$${item.credit}` : ''}</td>
                    </tr>
                  ))}

                  {/* Group total */}
                  <tr className="border-bottom">
                    <td className="p-2 border-1 fw-bold text-gray-9">Total {group.charAt(0) + group.slice(1).toLowerCase()}</td>
                    <td className="p-2 border-1 fw-bold text-gray-9">{totals.debit > 0 ? `$${totals.debit}` : ''}</td>
                    <td className="p-2 border-1 fw-bold text-gray-9">{totals.credit > 0 ? `$${totals.credit}` : ''}</td>
                  </tr>
                </React.Fragment>
              );
            })}

            {/* Grand total */}
            <tr>
              <td className="bg-secondary-transparent text-gray-9 fw-bold p-3">Total</td>
              <td className="bg-secondary-transparent text-gray-9 fw-bold p-3">${data.totalDebit}</td>
              <td className="bg-secondary-transparent text-gray-9 fw-bold p-3">${data.totalCredit}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrialBalanceTable;
