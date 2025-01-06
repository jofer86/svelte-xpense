<script lang="ts">
  import type { ActionData } from '$lib/types';
  import RegisterForm from '$lib/components/auth/RegisterForm.svelte';

  export let form: ActionData;
</script>

<div class="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <RegisterForm {form} />
</div>