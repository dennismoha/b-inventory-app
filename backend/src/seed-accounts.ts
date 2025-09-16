import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createStandardAccounts() {
  const accounts: Array<{
    account_number: string;
    name: string;
    type: 'ASSET' | 'LIABILITY' | 'EXPENSE' | 'EQUITY' | 'INCOME';
    opening_balance: number;
    running_balance: number;
  }> = [
    { account_number: '1000', name: 'Cash', type: 'ASSET', opening_balance: 0, running_balance: 0 },
    { account_number: '1010', name: 'Bank', type: 'ASSET', opening_balance: 0, running_balance: 0 },
    { account_number: '1200', name: 'Inventory', type: 'ASSET', opening_balance: 0, running_balance: 0 },
    { account_number: '2000', name: 'Accounts Payable', type: 'LIABILITY', opening_balance: 0, running_balance: 0 },
    { account_number: '3000', name: 'Capital', type: 'EQUITY', opening_balance: 0, running_balance: 0 },
    { account_number: '4000', name: 'Sales Revenue', type: 'INCOME', opening_balance: 0, running_balance: 0 },
    { account_number: '5000', name: 'Rent Expense', type: 'EXPENSE', opening_balance: 0, running_balance: 0 },
    { account_number: '5100', name: 'Utilities Expense', type: 'EXPENSE', opening_balance: 0, running_balance: 0 }
  ];

  for (const acc of accounts) {
    // check if account already exists
    const exists = await prisma.account.findUnique({
      where: { account_number: acc.account_number }
    });

    if (!exists) {
      await prisma.account.create({ data: acc });
      console.log(`Created account: ${acc.account_number} - ${acc.name}`);
    } else {
      console.log(`Account already exists: ${acc.account_number} - ${acc.name}`);
    }
  }
}

createStandardAccounts()
  .then(() => {
    console.log('All standard accounts processed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error creating accounts:', err);
    process.exit(1);
  });
