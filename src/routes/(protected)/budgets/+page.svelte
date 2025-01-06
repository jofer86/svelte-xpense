<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { page } from '$app/stores';
  import { invalidateAll } from '$app/navigation';

  export let data: PageData;
  export let form: ActionData;

  let showAddForm = false;
  let selectedMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

  $: categories = data.categories;
  $: budgets = data.budgets;

  function toggleAddForm() {
    showAddForm = !showAddForm;
  }

  const handleSubmit: SubmitFunction = () => {
    return async ({ update }) => {
      await update();
      await invalidateAll(); // This will refresh all page data
      showAddForm = false;
    };
  };

  const handleDelete: SubmitFunction = () => {
    return async ({ update }) => {
      await update();
      await invalidateAll(); // This will refresh all page data
    };
  };

  function calculateProgress(spent: string, amount: string): number {
    const spentNum = parseFloat(spent);
    const amountNum = parseFloat(amount);
    return (spentNum / amountNum) * 100;
  }

  function getProgressColor(progress: number): string {
    if (progress >= 100) return 'bg-red-500';
    if (progress >= 80) return 'bg-yellow-500';
    return 'bg-blue-500';
  }
</script>

<div class="py-6">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
    <h1 class="text-2xl font-semibold text-gray-900">Budget Management</h1>
  </div>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
    <div class="py-4">
      {#if !showAddForm}
        <button
          type="button"
          on:click={toggleAddForm}
          class="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Budget
        </button>
      {/if}

      {#if showAddForm}
        <div class="mt-4 bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium leading-6 text-gray-900">
              Create New Budget
            </h3>
            <form
              method="POST"
              action="?/create"
              use:enhance={handleSubmit}
              class="mt-5 space-y-4"
            >
              <div>
                <label
                  for="category"
                  class="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="categoryId"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {#each categories as category}
                    <option value={category.id}>{category.name}</option>
                  {/each}
                </select>
              </div>

              <div>
                <label
                  for="amount"
                  class="block text-sm font-medium text-gray-700"
                >
                  Amount
                </label>
                <div class="mt-1">
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    required
                    min="0"
                    step="0.01"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  for="month"
                  class="block text-sm font-medium text-gray-700"
                >
                  Month
                </label>
                <div class="mt-1">
                  <input
                    type="month"
                    name="month"
                    id="month"
                    required
                    value={selectedMonth}
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div class="flex justify-end space-x-3">
                <button
                  type="button"
                  on:click={toggleAddForm}
                  class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      {/if}

      {#if form?.message}
        <div class="mt-4 rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {form.message}
              </h3>
            </div>
          </div>
        </div>
      {/if}

      <div class="mt-8">
        <div class="overflow-hidden bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium leading-6 text-gray-900">
              Current Budgets
            </h3>
            <div class="mt-4">
              {#if budgets.length === 0}
                <p class="text-gray-500">No budgets set for this month.</p>
              {:else}
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Category
                        </th>
                        <th
                          scope="col"
                          class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Budget
                        </th>
                        <th
                          scope="col"
                          class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Spent
                        </th>
                        <th
                          scope="col"
                          class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Remaining
                        </th>
                        <th
                          scope="col"
                          class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Progress
                        </th>
                        <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span class="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      {#each budgets as budget}
                        {@const progress = calculateProgress(
                          budget.spent,
                          budget.amount
                        )}
                        <tr>
                          <td
                            class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                          >
                            <div class="flex items-center">
                              <span class="mr-2">{budget.category.icon}</span>
                              {budget.category.name}
                            </div>
                          </td>
                          <td
                            class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                          >
                            ${budget.amount}
                          </td>
                          <td
                            class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                          >
                            ${budget.spent}
                          </td>
                          <td
                            class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                          >
                            ${budget.remaining}
                          </td>
                          <td
                            class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                          >
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                class="h-2.5 rounded-full {getProgressColor(
                                  progress
                                )}"
                                style="width: {Math.min(progress, 100)}%"
                              ></div>
                            </div>
                          </td>
                          <td
                            class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                          >
                            <form
                              method="POST"
                              action="?/delete"
                              use:enhance={handleDelete}
                              class="inline-block"
                            >
                              <input
                                type="hidden"
                                name="id"
                                value={budget.id}
                              />
                              <button
                                type="submit"
                                class="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </form>
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>