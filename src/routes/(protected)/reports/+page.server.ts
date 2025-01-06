import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { ReportType } from '@prisma/client';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  try {
    const reports = await prisma.report.findMany({
      where: {
        userId: locals.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { reports };
  } catch (e) {
    console.error('Error loading reports:', e);
    throw error(500, 'Could not load reports');
  }
};

export const actions: Actions = {
  generate: async ({ request, locals }) => {
    if (!locals.user) {
      throw error(401, 'Unauthorized');
    }

    const data = await request.formData();
    const reportType = data.get('reportType')?.toString() as ReportType;
    const startDate = data.get('startDate')?.toString();
    const endDate = data.get('endDate')?.toString();

    if (!reportType || !startDate || !endDate) {
      return fail(400, {
        success: false,
        message: 'All fields are required'
      });
    }

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    if (endDateTime < startDateTime) {
      return fail(400, {
        success: false,
        message: 'End date must be after start date'
      });
    }

    try {
      // Get all transactions for the period
      const transactions = await prisma.transaction.findMany({
        where: {
          account: {
            userId: locals.user.id
          },
          date: {
            gte: startDateTime,
            lte: endDateTime
          }
        },
        include: {
          category: true,
          account: true
        }
      });

      // Get all budgets for the period
      const budgets = await prisma.budget.findMany({
        where: {
          userId: locals.user.id,
          month: {
            gte: startDateTime,
            lte: endDateTime
          }
        },
        include: {
          category: true
        }
      });

      // Generate report data based on type
      let reportData: any = {};

      switch (reportType) {
        case 'SPENDING_BY_CATEGORY': {
          const spendingByCategory = transactions.reduce((acc, tx) => {
            if (tx.type === 'EXPENSE') {
              const categoryId = tx.categoryId;
              acc[categoryId] = acc[categoryId] || {
                name: tx.category.name,
                icon: tx.category.icon,
                total: 0,
                count: 0
              };
              acc[categoryId].total += Number(tx.amount);
              acc[categoryId].count += 1;
            }
            return acc;
          }, {} as Record<string, { name: string; icon: string; total: number; count: number }>);

          reportData = {
            categories: Object.entries(spendingByCategory).map(([id, data]) => ({
              id,
              ...data
            }))
          };
          break;
        }

        case 'INCOME_VS_EXPENSE': {
          const totals = transactions.reduce(
            (acc, tx) => {
              if (tx.type === 'INCOME') {
                acc.income += Number(tx.amount);
              } else if (tx.type === 'EXPENSE') {
                acc.expenses += Number(tx.amount);
              }
              return acc;
            },
            { income: 0, expenses: 0 }
          );

          reportData = {
            income: totals.income,
            expenses: totals.expenses,
            balance: totals.income - totals.expenses
          };
          break;
        }

        case 'CASH_FLOW': {
          const dailyFlow = transactions.reduce((acc, tx) => {
            const date = tx.date.toISOString().split('T')[0];
            acc[date] = acc[date] || { income: 0, expenses: 0, net: 0 };

            if (tx.type === 'INCOME') {
              acc[date].income += Number(tx.amount);
            } else if (tx.type === 'EXPENSE') {
              acc[date].expenses += Number(tx.amount);
            }
            acc[date].net = acc[date].income - acc[date].expenses;
            return acc;
          }, {} as Record<string, { income: number; expenses: number; net: number }>);

          reportData = {
            dailyFlow: Object.entries(dailyFlow).map(([date, data]) => ({
              date,
              ...data
            }))
          };
          break;
        }

        case 'BUDGET_SUMMARY': {
          const spendingByCategory = transactions.reduce((acc, tx) => {
            if (tx.type === 'EXPENSE') {
              const categoryId = tx.categoryId;
              acc[categoryId] = (acc[categoryId] || 0) + Number(tx.amount);
            }
            return acc;
          }, {} as Record<string, number>);

          const budgetSummary = budgets.map(budget => ({
            category: {
              id: budget.categoryId,
              name: budget.category.name,
              icon: budget.category.icon
            },
            budgeted: Number(budget.amount),
            spent: spendingByCategory[budget.categoryId] || 0,
            remaining: Number(budget.amount) - (spendingByCategory[budget.categoryId] || 0)
          }));

          reportData = { budgets: budgetSummary };
          break;
        }
      }

      const report = await prisma.report.create({
        data: {
          userId: locals.user.id,
          reportType,
          startDate: startDateTime,
          endDate: endDateTime,
          reportData
        }
      });

      return {
        success: true,
        message: 'Report generated successfully'
      };
    } catch (e) {
      console.error('Error generating report:', e);
      return fail(500, {
        success: false,
        message: 'Could not generate report'
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
        message: 'Report ID is required'
      });
    }

    try {
      // Verify ownership before deleting
      const report = await prisma.report.findUnique({
        where: { id },
        select: { userId: true }
      });

      if (!report || report.userId !== locals.user.id) {
        return fail(403, {
          success: false,
          message: 'Not authorized to delete this report'
        });
      }

      await prisma.report.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Report deleted successfully'
      };
    } catch (e) {
      console.error('Error deleting report:', e);
      return fail(500, {
        success: false,
        message: 'Could not delete report'
      });
    }
  }
};