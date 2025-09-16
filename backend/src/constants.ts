import { AccountType } from './features/accounting/interfaces/accounts.interface';

export const BASE_PATH = '/api/v1';
export const PORT = 8000;
export const SERVER_PORT = 8081;

export const ROLES_LIST = {
  Admin: 5150,
  Editor: 1984,
  User: 2001
} as const;

export type RoleValue = (typeof ROLES_LIST)[keyof typeof ROLES_LIST];
export type Role = 'user' | 'admin';

// ACCounts

export const Account_Inventory: { name: string; acc_type: AccountType } = { name: 'Inventory', acc_type: 'ASSET' };

type AcccountsStructure = { name: string; acc_type: AccountType };

export const Account_Cash: AcccountsStructure = {
  name: 'Cash',
  acc_type: 'ASSET'
};

export const Account_Bank: AcccountsStructure = {
  name: 'Bank',
  acc_type: 'ASSET'
};

export const Account_AP: AcccountsStructure = {
  name: 'Accounts Payable',
  acc_type: 'LIABILITY'
};

export const Account_Capital: AcccountsStructure = {
  name: 'Capital',
  acc_type: 'EQUITY'
};

export const Account_Sales: AcccountsStructure = {
  name: 'Sales Revenue',
  acc_type: 'INCOME'
};

export const Account_Rent: AcccountsStructure = {
  name: 'Rent Expense',
  acc_type: 'EXPENSE'
};

export const Account_Utilities: AcccountsStructure = {
  name: 'Utilities Expense',
  acc_type: 'EXPENSE'
};
