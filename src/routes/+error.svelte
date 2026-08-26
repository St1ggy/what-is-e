<script lang="ts">
  import { resolve } from '$app/paths'
  import { page } from '$app/state'

  import * as m from '@/paraglide/messages'
</script>

<svelte:head>
  <title>{page.status === 404 ? m.notFoundTitle() : m.errorTitle()}</title>
</svelte:head>

<section class="status-page">
  <p class="eyebrow">{page.status}</p>
  <h1>{page.status === 404 ? m.notFoundTitle() : m.errorTitle()}</h1>
  <p class="status-description">{page.status === 404 ? m.notFoundDescription() : m.errorDescription()}</p>
  <a href={resolve('/')}>{m.backHome()}</a>
</section>
