<script lang="ts">
  import type { ActionData } from '$lib/types';
  import LoginForm from '$lib/components/auth/LoginForm.svelte';

  export let form: ActionData;
</script>

<div class="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <LoginForm {form} />
</div>