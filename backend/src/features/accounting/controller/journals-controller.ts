// src/features/accounting/service/journal-service.ts
// import prisma, { PrismaClient } from '@src/shared/prisma/prisma-client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaTransactionalClient } from '@src/shared/prisma/prisma-client'; // Prisma client to interact with the database
import { JournalEntryInput } from '../interfaces/financial-reports.interface';

export class JournalService {
  /**
   * Create a JournalEntry with JournalLines and update account balances.   *
   */
  static async createJournalEntry(tx: PrismaTransactionalClient, data: JournalEntryInput) {
    const { transactionId, description, lines } = data;

    if (!lines || lines.length < 2) {
      throw new Error('Journal entry requires at least 2 lines (debit & credit).');
    }

    // Normalize lines
    const normalized = lines.map((l) => ({
      account_id: l.account_id,
      debit: Number(l.debit ?? 0),
      credit: Number(l.credit ?? 0)
    }));

    // Check totals
    const totalDebit = normalized.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = normalized.reduce((sum, l) => sum + l.credit, 0);
    if (Math.abs(totalDebit - totalCredit) > 1e-9) {
      throw new Error(`Journal not balanced. totalDebit=${totalDebit}, totalCredit=${totalCredit}`);
    }

    console.log('transaction id is ', data);

    // Create JournalEntry
    const je = await tx.journalEntry.create({
      data: {
        transactionId,
        description,
        date: new Date(),
        lines: {
          create: normalized.map((l) => ({
            account_id: l.account_id,
            debit: new Decimal(l.debit),
            credit: new Decimal(l.credit)
          }))
        }
      },
      include: { lines: true }
    });

    // Update running balances
    //   for (const line of je.lines) {
    //     console.log('updating account running balance for line', line);
    //     const net = Number(line.debit) - Number(line.credit);
    //     console.log('net amount for line', net);
    //  const upda =   await tx.account.update({
    //       where: { account_id: line.account_id },
    //       data: { running_balance: { increment: new Decimal(net) } }
    //     });
    //     console.log('updated account running balance', upda);
    //   }

    for (const line of je.lines) {
      console.log('Updating account running balance for line', line);

      const debit = new Decimal(line.debit || 0);
      const credit = new Decimal(line.credit || 0);
      const net = debit.minus(credit);

      console.log('Net amount for line', net.toString());

      const updated = await tx.account.update({
        where: { account_id: line.account_id },
        data: {
          running_balance: { increment: Number(net) }
        },
        select: { account_id: true, running_balance: true }
      });

      console.log('Updated account running balance:', updated);
    }
    return je;
  }
}
