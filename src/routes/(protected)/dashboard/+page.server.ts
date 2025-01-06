import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
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

    const [
      accounts,
      budgets,
      recentTransactions,
      monthlyTransactions
    ] = await Promise.all([
      // Get all accounts with total balance
      prisma.account.findMany({
        where: {
          userId: locals.user.userId
        },
        orderBy: {
          name: 'asc'
        }
      }),
      // Get current month's budgets with categories
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
      // Get recent transactions
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
        },
        take: 5
      }),
      // Get all transactions for the current month
      prisma.transaction.findMany({
        where: {
          account: {
            userId: locals.user.userId
          },
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

    // Calculate total balance
    const totalBalance = accounts.reduce(
      (sum, account) => sum.add(account.balance),
      new Prisma.Decimal(0)
    );

    // Calculate monthly income and expenses
    const monthlyTotals = monthlyTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'INCOME') {
          acc.income = acc.income.add(transaction.amount);
        } else if (transaction.type === 'EXPENSE') {
          acc.expenses = acc.expenses.add(transaction.amount);
        }
        return acc;
      },
      { income: new Prisma.Decimal(0), expenses: new Prisma.Decimal(0) }
    );

    // Calculate spending by category
    const spendingByCategory = monthlyTransactions.reduce((acc, transaction) => {
      if (transaction.type === 'EXPENSE') {
        const categoryId = transaction.categoryId;
        acc[categoryId] = (acc[categoryId] || new Prisma.Decimal(0)).add(
          transaction.amount
        );
      }
      return acc;
    }, {} as Record<string, Prisma.Decimal>);

    // Calculate budget alerts
    const budgetAlerts = budgets
      .map(budget => {
        const spent = spendingByCategory[budget.categoryId] || new Prisma.Decimal(0);
        const percentSpent = spent.dividedBy(budget.amount).times(100);
        return {
          categoryName: budget.category.name,
          categoryIcon: budget.category.icon,
          budget: budget.amount.toString(),
          spent: spent.toString(),
          remaining: budget.amount.sub(spent).toString(),
          percentSpent: percentSpent.toNumber(),
          alert:
            percentSpent.gte(100)
              ? 'exceeded'
              : percentSpent.gte(80)
              ? 'warning'
              : 'normal'
        };
      })
      .filter(alert => alert.alert !== 'normal');

    return {
      accounts: accounts.map(account => ({
        ...account,
        balance: account.balance.toString()
      })),
      totalBalance: totalBalance.toString(),
      monthlyIncome: monthlyTotals.income.toString(),
      monthlyExpenses: monthlyTotals.expenses.toString(),
      recentTransactions: recentTransactions.map(tx => ({
        ...tx,
        amount: tx.amount.toString(),
        account: {
          ...tx.account,
          balance: tx.account.balance.toString()
        }
      })),
      budgetAlerts,
      spendingByCategory: Object.entries(spendingByCategory).map(([categoryId, amount]) => ({
        categoryId,
        amount: amount.toString()
      }))
    };
  } catch (e) {
    console.error('Error loading dashboard:', e);
    throw error(500, 'Could not load dashboard data');
  }
};