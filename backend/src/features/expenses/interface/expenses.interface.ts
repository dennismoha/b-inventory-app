export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  expenseDate: Date;
  purchaseId: string | null;
  batch: string | null;
  isGeneral: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// export interface ExpenseCreateDTO {
//    purchaseId?: string;
//       description: string;
//       amount: Decimal;
//       category: 'RENT' | 'UTILITIES' | 'SALARIES' | 'TRANSPORT' | 'TRAVEL' | 'MAINTENANCE' | 'OTHER' | 'PURCHASE' | 'TRAVEL';
//       accountId: string;
//       batch?: string;
//       isGeneral?: boolean;
// }
