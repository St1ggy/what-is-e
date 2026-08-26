<script lang="ts">
  import { SiteFooter } from '@/widgets/site-footer'

  import type { Snippet } from 'svelte'

  const { children }: { children: Snippet } = $props()
</script>

<div class="site-shell">
  <main>{@render children()}</main>
  <SiteFooter />
</div>
