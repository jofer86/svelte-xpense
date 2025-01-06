<script lang="ts">
  import type { PageData } from './$types';
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';

  export let data: PageData;

  interface ActionData {
    success?: boolean;
    message?: string;
  }

  export let form: ActionData | null = null;

  let showAddForm = false;
  let isSubmitting = false;

  const transactionTypes = ['EXPENSE', 'INCOME', 'TRANSFER'] as const;
  const frequencies = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const;

  function handleSubmit() {
    return async ({ update }: { update: () => Promise<void> }) => {
      isSubmitting = true;
      try {
        await update();
        await invalidateAll();
        if (form?.success) {
          showAddForm = false;
        }
      } finally {
        isSubmitting = false;
      }
    };
  }

  function formatDate(dateStr: string | Date): string {
    const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function formatFrequency(frequency: string, interval: number | null = 1): string {
    const intervalNum = interval || 1;
    if (intervalNum === 1) {
      return frequency.toLowerCase();
    }
    return `every ${intervalNum} ${frequency.toLowerCase()}s`;
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-semibold text-gray-900">Recurring Transactions</h1>
    <button
      class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      on:click={() => (showAddForm = !showAddForm)}
    >
      {showAddForm ? 'Cancel' : 'Add Recurring Transaction'}
    </button>
  </div>

  {#if form?.message}
    <div class="mb-4 p-4 rounded {form.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
      {form.message}
    </div>
  {/if}

  {#if showAddForm}
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Add New Recurring Transaction</h3>
      <form method="POST" action="?/create" use:enhance={handleSubmit}>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700">Transaction Type</label>
            <select
              id="type"
              name="type"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a type</option>
              {#each transactionTypes as type}
                <option value={type}>{type}</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="account" class="block text-sm font-medium text-gray-700">Account</label>
            <select
              id="account"
              name="accountId"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select an account</option>
              {#each data.accounts as account}
                <option value={account.id}>{account.name} ({account.currency})</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="amount" class="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              step="0.01"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category"
              name="categoryId"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {#each data.categories as category}
                <option value={category.id}>{category.name}</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="frequency" class="block text-sm font-medium text-gray-700">Frequency</label>
            <select
              id="frequency"
              name="frequency"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select frequency</option>
              {#each frequencies as frequency}
                <option value={frequency}>{frequency}</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="interval" class="block text-sm font-medium text-gray-700">Interval</label>
            <input
              type="number"
              id="interval"
              name="interval"
              min="1"
              required
              value="1"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="startDate" class="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="endDate" class="block text-sm font-medium text-gray-700">End Date (Optional)</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div class="sm:col-span-2">
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div class="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Recurring Transaction'}
          </button>
        </div>
      </form>
    </div>
  {/if}

  <div class="bg-white shadow rounded-lg overflow-hidden">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Date</th>
          <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each data.recurringTransactions as transaction}
          <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {transaction.description}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {transaction.category.name}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {transaction.account.name}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span class={transaction.type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'}>
                {transaction.type === 'EXPENSE' ? '-' : '+'}
                {parseFloat(transaction.amount).toFixed(2)} {transaction.account.currency}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {formatFrequency(transaction.frequency, transaction.interval)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {formatDate(transaction.nextOccurrence)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <form method="POST" action="?/delete" use:enhance={handleSubmit} class="inline">
                <input type="hidden" name="id" value={transaction.id} />
                <button
                  type="submit"
                  class="text-red-600 hover:text-red-900"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </form>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>