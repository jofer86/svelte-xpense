<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

  $: ({
    accounts,
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    recentTransactions,
    budgetAlerts
  } = data);

  function formatCurrency(amount: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  }

  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<div class="py-6">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
    <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
  </div>

  <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
    <!-- Financial Overview -->
    <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Total Balance -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Total Balance
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {formatCurrency(totalBalance)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Income -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Monthly Income
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {formatCurrency(monthlyIncome)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Expenses -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Monthly Expenses
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {formatCurrency(monthlyExpenses)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
      <!-- Recent Transactions -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium leading-6 text-gray-900">
            Recent Transactions
          </h3>
          <div class="mt-5 flow-root">
            <div class="-my-4 divide-y divide-gray-200">
              {#each recentTransactions as transaction}
                <div class="py-4">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <span class="text-2xl">{transaction.category.icon}</span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <p class="truncate text-sm text-gray-500">
                        {transaction.account.name} • {formatDate(transaction.date)}
                      </p>
                    </div>
                    <div class="flex-shrink-0 text-sm font-medium {transaction.type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'}">
                      {transaction.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
          <div class="mt-6">
            <a
              href="/transactions"
              class="flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              View all transactions
            </a>
          </div>
        </div>
      </div>

      <!-- Budget Alerts -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium leading-6 text-gray-900">
            Budget Alerts
          </h3>
          <div class="mt-5 flow-root">
            <div class="-my-4 divide-y divide-gray-200">
              {#each budgetAlerts as alert}
                <div class="py-4">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <span class="text-2xl">{alert.categoryIcon}</span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-medium text-gray-900">
                        {alert.categoryName}
                      </p>
                      <p class="text-sm text-gray-500">
                        Spent {formatCurrency(alert.spent)} of {formatCurrency(alert.budget)}
                      </p>
                      <div class="mt-1">
                        <div class="w-full bg-gray-200 rounded-full h-2">
                          <div
                            class="h-2 rounded-full {alert.alert === 'exceeded' ? 'bg-red-500' : 'bg-yellow-500'}"
                            style="width: {Math.min(alert.percentSpent, 100)}%"
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div class="flex-shrink-0">
                      <span
                        class="{alert.alert === 'exceeded'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'} inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      >
                        {alert.alert === 'exceeded' ? 'Exceeded' : 'Warning'}
                      </span>
                    </div>
                  </div>
                </div>
              {:else}
                <p class="py-4 text-sm text-gray-500">
                  No budget alerts at this time.
                </p>
              {/each}
            </div>
          </div>
          <div class="mt-6">
            <a
              href="/budgets"
              class="flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Manage budgets
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>