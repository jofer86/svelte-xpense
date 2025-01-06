import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import type { RequestEvent } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const accounts = await prisma.account.findMany({
    where: {
      userId: locals.user.userId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Convert Decimal to string for serialization
  return {
    accounts: accounts.map(account => ({
      ...account,
      balance: account.balance.toString()
    }))
  };
};

export const actions: Actions = {
  create: async (event: RequestEvent) => {
    if (!event.locals.user) {
      throw error(401, 'Unauthorized');
    }

    const formData = await event.request.formData();
    const name = formData.get('name')?.toString();
    const type = formData.get('type')?.toString();
    const balance = formData.get('balance')?.toString();
    const currency = formData.get('currency')?.toString();

    if (!name || !type || !balance || !currency) {
      return fail(400, {
        success: false,
        message: 'All fields are required'
      });
    }

    try {
      // Check if account name already exists for this user
      const existingAccount = await prisma.account.findFirst({
        where: {
          userId: event.locals.user.userId,
          name
        }
      });

      if (existingAccount) {
        return fail(400, {
          success: false,
          message: 'An account with this name already exists'
        });
      }

      const newAccount = await prisma.account.create({
        data: {
          user: { connect: { id: event.locals.user.userId } },
          name,
          type,
          balance: parseFloat(balance),
          currency
        }
      });

      return {
        success: true,
        account: {
          ...newAccount,
          balance: newAccount.balance.toString()
        }
      };
    } catch (e) {
      console.error('Account creation error:', e);
      return fail(500, {
        success: false,
        message: 'Could not create account'
      });
    }
  },

  update: async (event: RequestEvent) => {
    if (!event.locals.user) {
      throw error(401, 'Unauthorized');
    }

    const formData = await event.request.formData();
    const id = formData.get('id')?.toString();
    const name = formData.get('name')?.toString();
    const type = formData.get('type')?.toString();
    const currency = formData.get('currency')?.toString();

    if (!id || !name || !type || !currency) {
      return fail(400, {
        success: false,
        message: 'All fields are required'
      });
    }

    try {
      // Check if account exists and belongs to user
      const account = await prisma.account.findUnique({
        where: { id }
      });

      if (!account || account.userId !== event.locals.user.userId) {
        return fail(404, {
          success: false,
          message: 'Account not found'
        });
      }

      // Check if new name conflicts with existing account
      const existingAccount = await prisma.account.findFirst({
        where: {
          userId: event.locals.user.userId,
          name,
          NOT: {
            id
          }
        }
      });

      if (existingAccount) {
        return fail(400, {
          success: false,
          message: 'An account with this name already exists'
        });
      }

      const updatedAccount = await prisma.account.update({
        where: { id },
        data: {
          name,
          type,
          currency
        }
      });

      return {
        success: true,
        account: {
          ...updatedAccount,
          balance: updatedAccount.balance.toString()
        }
      };
    } catch (e) {
      console.error('Account update error:', e);
      return fail(500, {
        success: false,
        message: 'Could not update account'
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
        message: 'Account ID is required'
      });
    }

    try {
      // Check if account exists and belongs to user
      const account = await prisma.account.findUnique({
        where: { id },
        include: {
          transactions: true,
          recurringTransactions: true
        }
      });

      if (!account || account.userId !== event.locals.user.userId) {
        return fail(404, {
          success: false,
          message: 'Account not found'
        });
      }

      // Check if account has any transactions
      if (account.transactions.length > 0 || account.recurringTransactions.length > 0) {
        return fail(400, {
          success: false,
          message: 'Cannot delete account with existing transactions'
        });
      }

      await prisma.account.delete({
        where: { id }
      });

      return { success: true };
    } catch (e) {
      console.error('Account deletion error:', e);
      return fail(500, {
        success: false,
        message: 'Could not delete account'
      });
    }
  }
};