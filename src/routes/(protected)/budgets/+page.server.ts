import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import type { RequestEvent } from '@sveltejs/kit';
import { Prisma } from '@prisma/client';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  try {
    // Get the start and end of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    console.log('Loading budgets for:', {
      userId: locals.user.userId,
      startOfMonth: startOfMonth.toISOString(),
      endOfMonth: endOfMonth.toISOString()
    });

    const [categories, budgets, currentMonthTransactions] = await Promise.all([
      // Get expense categories
      prisma.category.findMany({
        where: {
          userId: locals.user.userId,
          type: 'EXPENSE'
        },
        orderBy: {
          name: 'asc'
        }
      }),
      // Get current month's budgets
      prisma.budget.findMany({
        where: {
          userId: locals.user.userId,
          month: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        include: {
          category: true
        }
      }),
      // Get current month's transactions
      prisma.transaction.findMany({
        where: {
          account: {
            userId: locals.user.userId
          },
          type: 'EXPENSE',
          date: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        include: {
          category: true
        }
      })
    ]);

    console.log('Found budgets:', budgets);
    console.log('Found transactions:', currentMonthTransactions);

    // Calculate spending by category
    const spendingByCategory = currentMonthTransactions.reduce((acc, transaction) => {
      const categoryId = transaction.categoryId;
      acc[categoryId] = (acc[categoryId] || new Prisma.Decimal(0)).add(transaction.amount);
      return acc;
    }, {} as Record<string, Prisma.Decimal>);

    return {
      categories,
      budgets: budgets.map(budget => ({
        ...budget,
        amount: budget.amount.toString(),
        spent: (spendingByCategory[budget.categoryId] || new Prisma.Decimal(0)).toString(),
        remaining: budget.amount
          .sub(spendingByCategory[budget.categoryId] || new Prisma.Decimal(0))
          .toString()
      }))
    };
  } catch (e) {
    console.error('Error loading budgets:', e);
    throw error(500, 'Could not load budgets');
  }
};

export const actions: Actions = {
  create: async (event: RequestEvent) => {
    if (!event.locals.user) {
      throw error(401, 'Unauthorized');
    }

    const formData = await event.request.formData();
    const categoryId = formData.get('categoryId')?.toString();
    const amount = formData.get('amount')?.toString();
    const month = formData.get('month')?.toString();

    if (!categoryId || !amount || !month) {
      return fail(400, {
        success: false,
        message: 'All fields are required'
      });
    }

    try {
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

      // Parse the month string (YYYY-MM) and set it to the first day of the month
      const [year, monthStr] = month.split('-');
      const budgetDate = new Date(parseInt(year), parseInt(monthStr) - 1, 1);

      console.log('Creating budget:', {
        userId: event.locals.user.userId,
        categoryId,
        amount,
        month: budgetDate.toISOString()
      });

      // Create or update budget
      const budget = await prisma.budget.upsert({
        where: {
          userId_categoryId_month: {
            userId: event.locals.user.userId,
            categoryId,
            month: budgetDate
          }
        },
        create: {
          userId: event.locals.user.userId,
          categoryId,
          amount: new Prisma.Decimal(amount),
          month: budgetDate
        },
        update: {
          amount: new Prisma.Decimal(amount)
        },
        include: {
          category: true
        }
      });

      console.log('Created budget:', budget);

      return {
        success: true,
        budget: {
          ...budget,
          amount: budget.amount.toString()
        }
      };
    } catch (e) {
      console.error('Budget creation error:', e);
      return fail(500, {
        success: false,
        message: 'Could not create budget'
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
        message: 'Budget ID is required'
      });
    }

    try {
      // Verify budget belongs to user
      const budget = await prisma.budget.findUnique({
        where: { id }
      });

      if (!budget || budget.userId !== event.locals.user.userId) {
        return fail(404, {
          success: false,
          message: 'Budget not found'
        });
      }

      await prisma.budget.delete({
        where: { id }
      });

      return { success: true };
    } catch (e) {
      console.error('Budget deletion error:', e);
      return fail(500, {
        success: false,
        message: 'Could not delete budget'
      });
    }
  }
};