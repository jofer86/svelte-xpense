import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { Prisma, TransactionType, Frequency } from '@prisma/client';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  try {
    const [accounts, categories, recurringTransactions] = await Promise.all([
      prisma.account.findMany({
        where: {
          userId: locals.user.id
        },
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.category.findMany({
        where: {
          userId: locals.user.id
        },
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.recurringTransaction.findMany({
        where: {
          userId: locals.user.id
        },
        include: {
          account: true,
          category: true
        },
        orderBy: {
          nextOccurrence: 'asc'
        }
      })
    ]);

    return {
      accounts: accounts.map(account => ({
        ...account,
        balance: account.balance.toString()
      })),
      categories,
      recurringTransactions: recurringTransactions.map(tx => ({
        ...tx,
        amount: tx.amount.toString(),
        account: {
          ...tx.account,
          balance: tx.account.balance.toString()
        }
      }))
    };
  } catch (e) {
    console.error('Error loading recurring transactions:', e);
    throw error(500, 'Could not load recurring transactions');
  }
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    if (!locals.user) {
      throw error(401, 'Unauthorized');
    }

    const data = await request.formData();
    const type = data.get('type')?.toString() as TransactionType;
    const accountId = data.get('accountId')?.toString();
    const amount = data.get('amount')?.toString();
    const categoryId = data.get('categoryId')?.toString();
    const description = data.get('description')?.toString();
    const frequency = data.get('frequency')?.toString() as Frequency;
    const interval = parseInt(data.get('interval')?.toString() || '1');
    const startDate = data.get('startDate')?.toString();
    const endDate = data.get('endDate')?.toString() || null;

    if (!type || !accountId || !amount || !categoryId || !description || !frequency || !startDate) {
      return fail(400, {
        success: false,
        message: 'All required fields must be filled'
      });
    }

    try {
      // Get the account to access its currency
      const account = await prisma.account.findUnique({
        where: { id: accountId },
        select: { currency: true, userId: true }
      });

      if (!account || account.userId !== locals.user.id) {
        return fail(400, {
          success: false,
          message: 'Invalid account selected'
        });
      }

      await prisma.recurringTransaction.create({
        data: {
          type,
          accountId,
          amount: new Prisma.Decimal(amount),
          categoryId,
          description,
          frequency,
          interval,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          nextOccurrence: new Date(startDate),
          userId: locals.user.id,
          currency: account.currency
        },
        include: {
          account: true,
          category: true
        }
      });

      return {
        success: true,
        message: 'Recurring transaction created successfully'
      };
    } catch (e) {
      console.error('Error creating recurring transaction:', e);
      return fail(500, {
        success: false,
        message: 'Could not create recurring transaction'
      });
    }
  },

  delete: async ({ request, locals }) => {
    if (!locals.user) {
      throw error(401, 'Unauthorized');
    }

    const data = await request.formData();
    const id = data.get('id')?.toString();

    if (!id) {
      return fail(400, {
        success: false,
        message: 'Transaction ID is required'
      });
    }

    try {
      // Verify ownership before deleting
      const transaction = await prisma.recurringTransaction.findUnique({
        where: { id },
        select: { userId: true }
      });

      if (!transaction || transaction.userId !== locals.user.id) {
        return fail(403, {
          success: false,
          message: 'Not authorized to delete this transaction'
        });
      }

      await prisma.recurringTransaction.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Recurring transaction deleted successfully'
      };
    } catch (e) {
      console.error('Error deleting recurring transaction:', e);
      return fail(500, {
        success: false,
        message: 'Could not delete recurring transaction'
      });
    }
  }
};