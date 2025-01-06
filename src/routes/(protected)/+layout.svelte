<script lang="ts">
  import { page } from '$app/stores';
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';

  let showTransactionsMenu = false;
  let transactionsButton: HTMLButtonElement;
  let transactionsMenu: HTMLDivElement;

  function handleClickOutside(event: MouseEvent) {
    if (showTransactionsMenu &&
        transactionsButton &&
        transactionsMenu &&
        !transactionsButton.contains(event.target as Node) &&
        !transactionsMenu.contains(event.target as Node)) {
      showTransactionsMenu = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<div class="min-h-screen bg-gray-100">
  <nav class="bg-white shadow">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between">
        <div class="flex">
          <div class="flex flex-shrink-0 items-center">
            <a href="/" class="text-xl font-bold text-gray-800">ExpenseTracker</a>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <a
              href="/dashboard"
              class="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 {$page.url.pathname === '/dashboard'
                ? 'border-blue-500 text-gray-900'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
            >
              Dashboard
            </a>
            <a
              href="/accounts"
              class="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 {$page.url.pathname === '/accounts'
                ? 'border-blue-500 text-gray-900'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
            >
              Accounts
            </a>
            <div class="relative inline-flex items-center">
              <button
                bind:this={transactionsButton}
                on:click={() => (showTransactionsMenu = !showTransactionsMenu)}
                class="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 {$page.url.pathname.startsWith('/transaction') || $page.url.pathname.startsWith('/recurring')
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
                aria-expanded={showTransactionsMenu}
              >
                Transactions
                <svg
                  class="ml-2 h-5 w-5 transition-transform duration-200 {showTransactionsMenu ? 'rotate-180' : ''}"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
              {#if showTransactionsMenu}
                <div
                  bind:this={transactionsMenu}
                  class="absolute left-0 z-10 mt-14 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="transactions-menu"
                >
                  <a
                    href="/transactions"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    All Transactions
                  </a>
                  <a
                    href="/recurring"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Recurring Transactions
                  </a>
                </div>
              {/if}
            </div>
            <a
              href="/budgets"
              class="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 {$page.url.pathname === '/budgets'
                ? 'border-blue-500 text-gray-900'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
            >
              Budgets
            </a>
            <a
              href="/reports"
              class="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 {$page.url.pathname === '/reports'
                ? 'border-blue-500 text-gray-900'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
            >
              Reports
            </a>
          </div>
        </div>
        <div class="flex items-center">
          <form
            action="/logout"
            method="POST"
            use:enhance
            class="text-gray-500 hover:text-gray-700"
          >
            <button type="submit">Logout</button>
          </form>
        </div>
      </div>
    </div>
  </nav>

  <main>
    <div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <slot />
    </div>
  </main>
</div>

<style>
  /* Close dropdown when clicking outside */
  :global(html) {
    height: 100%;
  }
  :global(body) {
    height: 100%;
  }
  :global(body:has(.relative > button[aria-expanded="true"])) {
    cursor: pointer;
  }
  :global(body:has(.relative > button[aria-expanded="true"])):active {
    cursor: default;
  }
</style>