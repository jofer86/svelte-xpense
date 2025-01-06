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

  let showGenerateForm = false;
  let isSubmitting = false;
  let selectedReport = '';

  const reportTypes = [
    { id: 'SPENDING_BY_CATEGORY', name: 'Spending by Category', icon: '📊' },
    { id: 'INCOME_VS_EXPENSE', name: 'Income vs Expense', icon: '💰' },
    { id: 'CASH_FLOW', name: 'Cash Flow', icon: '💸' },
    { id: 'BUDGET_SUMMARY', name: 'Budget Summary', icon: '📈' }
  ];

  function handleSubmit() {
    return async ({ update }: { update: () => Promise<void> }) => {
      isSubmitting = true;
      try {
        await update();
        await invalidateAll();
        if (form?.success) {
          showGenerateForm = false;
        }
      } finally {
        isSubmitting = false;
      }
    };
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
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold text-gray-900">Reports</h1>
      <button
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        on:click={() => (showGenerateForm = !showGenerateForm)}
      >
        {showGenerateForm ? 'Cancel' : 'Generate Report'}
      </button>
    </div>

    {#if form?.message}
      <div class="mt-4 p-4 rounded {form.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
        {form.message}
      </div>
    {/if}

    {#if showGenerateForm}
      <div class="mt-6 bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Generate New Report</h3>
        <form method="POST" action="?/generate" use:enhance={handleSubmit}>
          <div class="space-y-6">
            <div>
              <label class="text-sm font-medium text-gray-700">Report Type</label>
              <div class="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {#each reportTypes as type}
                  <label class="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none">
                    <input
                      type="radio"
                      name="reportType"
                      value={type.id}
                      class="sr-only"
                      bind:group={selectedReport}
                    />
                    <span class="flex flex-1">
                      <span class="flex flex-col">
                        <span class="flex items-center text-sm font-medium text-gray-900">
                          <span class="mr-2">{type.icon}</span>
                          {type.name}
                        </span>
                      </span>
                    </span>
                    <span
                      class="pointer-events-none absolute -inset-px rounded-lg border-2 {selectedReport === type.id
                        ? 'border-blue-500'
                        : 'border-transparent'}"
                      aria-hidden="true"
                    />
                  </label>
                {/each}
              </div>
            </div>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                <label for="endDate" class="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                disabled={!selectedReport || isSubmitting}
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {isSubmitting ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </form>
      </div>
    {/if}

    <div class="mt-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Recent Reports</h2>
      {#if data.reports.length === 0}
        <p class="text-gray-500">No reports generated yet.</p>
      {:else}
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul class="divide-y divide-gray-200">
            {#each data.reports as report}
              <li>
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <span class="text-2xl mr-3">
                        {#if report.reportType === 'SPENDING_BY_CATEGORY'}
                          📊
                        {:else if report.reportType === 'INCOME_VS_EXPENSE'}
                          💰
                        {:else if report.reportType === 'CASH_FLOW'}
                          💸
                        {:else if report.reportType === 'BUDGET_SUMMARY'}
                          📈
                        {/if}
                      </span>
                      <div>
                        <p class="text-sm font-medium text-blue-600 truncate">
                          {report.reportType.replace(/_/g, ' ')}
                        </p>
                        <p class="text-sm text-gray-500">
                          {formatDate(report.startDate)} - {formatDate(report.endDate)}
                        </p>
                      </div>
                    </div>
                    <div class="flex space-x-2">
                      <button
                        class="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        on:click={() => window.location.href = `/reports/${report.id}`}
                      >
                        View
                      </button>
                      <form method="POST" action="?/delete" use:enhance={handleSubmit} class="inline">
                        <input type="hidden" name="id" value={report.id} />
                        <button
                          type="submit"
                          class="text-red-600 hover:text-red-900 text-sm font-medium"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Deleting...' : 'Delete'}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </div>
</div>