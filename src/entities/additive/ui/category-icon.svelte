<script lang="ts">
  import { Candy, CookingPot, Gem, Layers, Leaf, Palette, Shapes, ShieldCheck } from '@lucide/svelte'

  import type { AdditiveCategory } from '../model/additive'

  const { category, size = 18 }: { category: AdditiveCategory; size?: number } = $props()
  const icons = {
    colors: Palette,
    preservatives: ShieldCheck,
    antioxidants: Leaf,
    texturizers: Layers,
    minerals: Gem,
    'flavor-enhancers': CookingPot,
    sweeteners: Candy,
    other: Shapes,
  }
  const CategoryIcon = $derived(icons[category])
</script>

<CategoryIcon {size} aria-hidden="true" />
