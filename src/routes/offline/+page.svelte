<script lang="ts">
  import { resolve } from '$app/paths'

  import * as m from '@/paraglide/messages'
</script>

<svelte:head>
  <title>{m.offlineTitle()}</title>
</svelte:head>

<section class="status-page">
  <p class="eyebrow">Offline</p>
  <h1>{m.offlineTitle()}</h1>
  <p class="status-description">{m.offlineDescription()}</p>
  <div class="status-actions">
    <button type="button" onclick={() => globalThis.location.reload()}>{m.retry()}</button>
    <a href={resolve('/')}>{m.backHome()}</a>
  </div>
</section>
