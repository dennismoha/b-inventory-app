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
