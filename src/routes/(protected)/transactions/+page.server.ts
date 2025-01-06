import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import type { RequestEvent } from '@sveltejs/kit';
import { Prisma } from '@prisma/client';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const [accounts, categories, transactions] = await Promise.all([
    prisma.account.findMany({
      where: {
        userId: locals.user.userId
      },
      orderBy: {
        name: 'asc'
      }
    }),
    prisma.category.findMany({
      where: {
        userId: locals.user.userId
      },
      orderBy: {
        name: 'asc'
      }
    }),
    prisma.transaction.findMany({
      where: {
        account: {
          userId: locals.user.userId
        }
      },
      include: {
        account: true,
        category: true
      },
      orderBy: {
        date: 'desc'
      }
    })
  ]);

  return {
    accounts: accounts.map(account => ({
      ...account,
      balance: account.balance.toString()
    })),
    categories,
    transactions: transactions.map(transaction => ({
      ...transaction,
      amount: transaction.amount.toString(),
      account: {
        ...transaction.account,
        balance: transaction.account.balance.toString()
      }
    }))
  };
};

export const actions: Actions = {
  create: async (event: RequestEvent) => {
    if (!event.locals.user) {
      throw error(401, 'Unauthorized');
    }

    const formData = await event.request.formData();
    const type = formData.get('type')?.toString();
    const accountId = formData.get('accountId')?.toString();
    const amount = formData.get('amount')?.toString();
    const categoryId = formData.get('categoryId')?.toString();
    const description = formData.get('description')?.toString();
    const date = formData.get('date')?.toString();

    if (!type || !accountId || !amount || !categoryId || !description || !date) {
      return fail(400, {
        success: false,
        message: 'All fields are required'
      });
    }

    try {
      // Verify account belongs to user
      const account = await prisma.account.findUnique({
        where: { id: accountId }
      });

      if (!account || account.userId !== event.locals.user.userId) {
        return fail(404, {
          success: false,
          message: 'Account not found'
        });
      }

      // Verify category belongs to user
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category || category.userId !== event.locals.user.userId) {
        return fail(404, {
          success: false,
          message: 'Category not found'
        });
      }

      // Calculate new balance
      const transactionAmount = new Prisma.Decimal(amount);
      let newBalance: Prisma.Decimal;

      if (type === 'EXPENSE') {
        // For expenses, subtract from balance
        newBalance = account.balance.sub(transactionAmount);
        if (newBalance.lessThan(0)) {
          return fail(400, {
            success: false,
            message: 'Insufficient funds'
          });
        }
      } else if (type === 'INCOME') {
        // For income, add to balance
        newBalance = account.balance.add(transactionAmount);
      } else if (type === 'TRANSFER') {
        // Handle transfers (if needed)
        return fail(400, {
          success: false,
          message: 'Transfer transactions are not supported yet'
        });
      } else {
        return fail(400, {
          success: false,
          message: 'Invalid transaction type'
        });
      }

      // Create transaction and update account balance in a transaction
      const [transaction] = await prisma.$transaction([
        prisma.transaction.create({
          data: {
            type: type as 'INCOME' | 'EXPENSE' | 'TRANSFER',
            amount: transactionAmount,
            description,
            date: new Date(date),
            accountId,
            categoryId
          },
          include: {
            account: true,
            category: true
          }
        }),
        prisma.account.update({
          where: { id: accountId },
          data: { balance: newBalance }
        })
      ]);

      return {
        success: true,
        transaction: {
          ...transaction,
          amount: transaction.amount.toString(),
          account: {
            ...transaction.account,
            balance: newBalance.toString()
          }
        }
      };
    } catch (e) {
      console.error('Transaction creation error:', e);
      return fail(500, {
        success: false,
        message: 'Could not create transaction'
      });
    }
  },

  delete: async (event: RequestEvent) => {
    if (!event.locals.user) {
      throw error(401, 'Unauthorized');
    }

    const formData = await event.request.formData();
    const id = formData.get('id')?.toString();

    if (!id) {
      return fail(400, {
        success: false,
        message: 'Transaction ID is required'
      });
    }

    try {
      // Verify transaction belongs to user and get amount
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: {
          account: true
        }
      });

      if (!transaction || transaction.account.userId !== event.locals.user.userId) {
        return fail(404, {
          success: false,
          message: 'Transaction not found'
        });
      }

      // Calculate new balance
      let newBalance: Prisma.Decimal;
      if (transaction.type === 'EXPENSE') {
        // When deleting an expense, add the amount back
        newBalance = transaction.account.balance.add(transaction.amount);
      } else if (transaction.type === 'INCOME') {
        // When deleting income, subtract the amount
        newBalance = transaction.account.balance.sub(transaction.amount);
        if (newBalance.lessThan(0)) {
          return fail(400, {
            success: false,
            message: 'Cannot delete transaction: would result in negative balance'
          });
        }
      } else {
        return fail(400, {
          success: false,
          message: 'Cannot delete transfer transactions'
        });
      }

      // Delete transaction and update account balance in a transaction
      await prisma.$transaction([
        prisma.transaction.delete({
          where: { id }
        }),
        prisma.account.update({
          where: { id: transaction.accountId },
          data: { balance: newBalance }
        })
      ]);

      return { success: true };
    } catch (e) {
      console.error('Transaction deletion error:', e);
      return fail(500, {
        success: false,
        message: 'Could not delete transaction'
      });
    }
  }
};