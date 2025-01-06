<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { invalidateAll } from '$app/navigation';

  export let data: PageData;
  export let form: ActionData;

  let showAddForm = false;
  let editingAccount: any = null;
  let isSubmitting = false;

  function startEdit(account: any) {
    editingAccount = { ...account };
  }

  function cancelEdit() {
    editingAccount = null;
  }

  const currencyOptions = [
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'
  ];

  const accountTypes = [
    'Checking',
    'Savings',
    'Credit Card',
    'Cash',
    'Investment',
    'Other'
  ];

  function handleSubmit() {
    return async ({ update }: { update: () => Promise<void> }) => {
      isSubmitting = true;
      try {
        await update();
        await invalidateAll();
        if (form?.success) {
          showAddForm = false;
          editingAccount = null;
        }
      } finally {
        isSubmitting = false;
      }
    };
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-semibold text-gray-900">Accounts</h1>
    <button
      class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      on:click={() => (showAddForm = !showAddForm)}
    >
      {showAddForm ? 'Cancel' : 'Add Account'}
    </button>
  </div>

  {#if form?.message}
    <div class="mb-4 p-4 rounded {form.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
      {form.message}
    </div>
  {/if}

  {#if showAddForm}
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Add New Account</h3>
      <form method="POST" action="?/create" use:enhance={handleSubmit}>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Account Name</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="type" class="block text-sm font-medium text-gray-700">Account Type</label>
            <select
              id="type"
              name="type"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a type</option>
              {#each accountTypes as type}
                <option value={type}>{type}</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="balance" class="block text-sm font-medium text-gray-700">Initial Balance</label>
            <input
              type="number"
              id="balance"
              name="balance"
              step="0.01"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="currency" class="block text-sm font-medium text-gray-700">Currency</label>
            <select
              id="currency"
              name="currency"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a currency</option>
              {#each currencyOptions as currency}
                <option value={currency}>{currency}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Account'}
          </button>
        </div>
      </form>
    </div>
  {/if}

  <div class="bg-white shadow rounded-lg overflow-hidden">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
          <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each data.accounts as account}
          <tr>
            {#if editingAccount?.id === account.id}
              <td colspan="5" class="px-6 py-4">
                <form method="POST" action="?/update" use:enhance={handleSubmit} class="space-y-4">
                  <input type="hidden" name="id" value={account.id} />
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label for="edit-name-{account.id}" class="block text-sm font-medium text-gray-700">Account Name</label>
                      <input
                        type="text"
                        id="edit-name-{account.id}"
                        name="name"
                        bind:value={editingAccount.name}
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label for="edit-type-{account.id}" class="block text-sm font-medium text-gray-700">Account Type</label>
                      <select
                        id="edit-type-{account.id}"
                        name="type"
                        bind:value={editingAccount.type}
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        {#each accountTypes as type}
                          <option value={type}>{type}</option>
                        {/each}
                      </select>
                    </div>

                    <div>
                      <label for="edit-currency-{account.id}" class="block text-sm font-medium text-gray-700">Currency</label>
                      <select
                        id="edit-currency-{account.id}"
                        name="currency"
                        bind:value={editingAccount.currency}
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        {#each currencyOptions as currency}
                          <option value={currency}>{currency}</option>
                        {/each}
                      </select>
                    </div>
                  </div>

                  <div class="flex justify-end space-x-2">
                    <button
                      type="button"
                      class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded"
                      on:click={cancelEdit}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </td>
            {:else}
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.name}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.type}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parseFloat(account.balance).toFixed(2)}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.currency}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  class="text-blue-600 hover:text-blue-900"
                  on:click={() => startEdit(account)}
                >
                  Edit
                </button>
                <form method="POST" action="?/delete" use:enhance={handleSubmit} class="inline">
                  <input type="hidden" name="id" value={account.id} />
                  <button
                    type="submit"
                    class="text-red-600 hover:text-red-900"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Deleting...' : 'Delete'}
                  </button>
                </form>
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>