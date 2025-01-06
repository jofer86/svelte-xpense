<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

  const { report } = data;

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function formatPercentage(value: number, total: number): string {
    return ((value / total) * 100).toFixed(1) + '%';
  }
</script>

<div class="py-6">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">
          {report.reportType.replace(/_/g, ' ')}
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          {formatDate(report.startDate)} - {formatDate(report.endDate)}
        </p>
      </div>
      <a
        href="/reports"
        class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
      >
        Back to Reports
      </a>
    </div>

    <div class="mt-6">
      {#if report.reportType === 'SPENDING_BY_CATEGORY'}
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Spending by Category</h3>
            <div class="space-y-4">
              {#each report.reportData.categories as category}
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center">
                      <span class="text-2xl mr-2">{category.icon}</span>
                      <span class="text-sm font-medium text-gray-900">{category.name}</span>
                    </div>
                    <span class="text-sm font-medium text-gray-900">{formatCurrency(category.total)}</span>
                  </div>
                  <div class="relative pt-1">
                    <div class="flex mb-2 items-center justify-between">
                      <div>
                        <span class="text-xs font-semibold inline-block text-blue-600">
                          {category.count} transactions
                        </span>
                      </div>
                      <div class="text-right">
                        <span class="text-xs font-semibold inline-block text-blue-600">
                          {formatPercentage(category.total, report.reportData.categories.reduce((sum, c) => sum + c.total, 0))}
                        </span>
                      </div>
                    </div>
                    <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                      <div
                        style="width: {formatPercentage(category.total, report.reportData.categories.reduce((sum, c) => sum + c.total, 0))}"
                        class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      />
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>

      {:else if report.reportType === 'INCOME_VS_EXPENSE'}
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Income vs Expenses</h3>
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div class="bg-green-50 rounded-lg p-5">
                <h4 class="text-sm font-medium text-green-700">Total Income</h4>
                <p class="mt-2 text-3xl font-semibold text-green-900">{formatCurrency(report.reportData.income)}</p>
              </div>
              <div class="bg-red-50 rounded-lg p-5">
                <h4 class="text-sm font-medium text-red-700">Total Expenses</h4>
                <p class="mt-2 text-3xl font-semibold text-red-900">{formatCurrency(report.reportData.expenses)}</p>
              </div>
              <div class="bg-blue-50 rounded-lg p-5">
                <h4 class="text-sm font-medium text-blue-700">Net Balance</h4>
                <p class="mt-2 text-3xl font-semibold {report.reportData.balance >= 0 ? 'text-green-900' : 'text-red-900'}">
                  {formatCurrency(report.reportData.balance)}
                </p>
              </div>
            </div>
          </div>
        </div>

      {:else if report.reportType === 'CASH_FLOW'}
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Daily Cash Flow</h3>
            <div class="space-y-4">
              {#each report.reportData.dailyFlow as flow}
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-900">{formatDate(flow.date)}</span>
                    <span class="text-sm font-medium {flow.net >= 0 ? 'text-green-600' : 'text-red-600'}">
                      {formatCurrency(flow.net)}
                    </span>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <div class="flex justify-between text-xs text-gray-500">
                        <span>Income</span>
                        <span>{formatCurrency(flow.income)}</span>
                      </div>
                      <div class="mt-1 overflow-hidden h-1.5 text-xs flex rounded bg-gray-200">
                        <div
                          style="width: {formatPercentage(flow.income, Math.max(flow.income, flow.expenses))}"
                          class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                        />
                      </div>
                    </div>
                    <div>
                      <div class="flex justify-between text-xs text-gray-500">
                        <span>Expenses</span>
                        <span>{formatCurrency(flow.expenses)}</span>
                      </div>
                      <div class="mt-1 overflow-hidden h-1.5 text-xs flex rounded bg-gray-200">
                        <div
                          style="width: {formatPercentage(flow.expenses, Math.max(flow.income, flow.expenses))}"
                          class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>

      {:else if report.reportType === 'BUDGET_SUMMARY'}
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Budget Summary</h3>
            <div class="space-y-4">
              {#each report.reportData.budgets as budget}
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center">
                      <span class="text-2xl mr-2">{budget.category.icon}</span>
                      <span class="text-sm font-medium text-gray-900">{budget.category.name}</span>
                    </div>
                    <span class="text-sm font-medium text-gray-500">
                      {formatCurrency(budget.spent)} of {formatCurrency(budget.budgeted)}
                    </span>
                  </div>
                  <div class="relative pt-1">
                    <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                      <div
                        style="width: {formatPercentage(budget.spent, budget.budgeted)}"
                        class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center {budget.spent > budget.budgeted ? 'bg-red-500' : budget.spent > budget.budgeted * 0.8 ? 'bg-yellow-500' : 'bg-green-500'}"
                      />
                    </div>
                    <div class="flex mb-2 items-center justify-between">
                      <div>
                        <span class="text-xs font-semibold inline-block {budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}">
                          {budget.remaining >= 0 ? 'Remaining: ' : 'Over by: '}{formatCurrency(Math.abs(budget.remaining))}
                        </span>
                      </div>
                      <div class="text-right">
                        <span class="text-xs font-semibold inline-block text-gray-600">
                          {formatPercentage(budget.spent, budget.budgeted)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>