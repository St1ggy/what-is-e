<script lang="ts">
  import { Candy, CookingPot, Gem, Layers3, Leaf, Palette, Shapes, ShieldCheck } from '@lucide/svelte'

  import type { AdditiveCategory } from '../model/additive'

  const { category, size = 18 }: { category: AdditiveCategory; size?: number } = $props()
</script>

{#if category === 'colors'}
  <Palette {size} aria-hidden="true" />
{:else if category === 'preservatives'}
  <ShieldCheck {size} aria-hidden="true" />
{:else if category === 'antioxidants'}
  <Leaf {size} aria-hidden="true" />
{:else if category === 'texturizers'}
  <Layers3 {size} aria-hidden="true" />
{:else if category === 'minerals'}
  <Gem {size} aria-hidden="true" />
{:else if category === 'flavor-enhancers'}
  <CookingPot {size} aria-hidden="true" />
{:else if category === 'sweeteners'}
  <Candy {size} aria-hidden="true" />
{:else}
  <Shapes {size} aria-hidden="true" />
{/if}
