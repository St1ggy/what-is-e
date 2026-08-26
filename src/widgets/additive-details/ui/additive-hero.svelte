<script lang="ts">
  import { type Additive, CategoryIcon, LegacyMarker, RiskBadge, getCategoryLabel } from '@/entities/additive'
  import { getLocale } from '@/paraglide/runtime'

  const { additive }: { additive: Additive } = $props()
</script>

<header class="detail-hero risk-surface-{additive.risk}">
  <div class="detail-code">{additive.code}</div>
  <div class="detail-title">
    <p class="eyebrow">
      <CategoryIcon category={additive.category} />
      {getCategoryLabel(additive.category, getLocale())}
    </p>
    <h1>{additive.name}</h1>
    {#if additive.nameEn}<p class="english-name">{additive.nameEn}</p>{/if}
    <RiskBadge risk={additive.risk} />
  </div>
  {#if additive.legacy}<LegacyMarker corner />{/if}
</header>
