<script lang="ts">
  import { type Additive, localizeAdditive } from '@/entities/additive'
  import { getLocale } from '@/paraglide/runtime'

  import AdditiveHero from './additive-hero.svelte'
  import AdditiveJurisdictionsSection from './additive-jurisdictions-section.svelte'
  import AdditiveOverviewSection from './additive-overview-section.svelte'
  import AdditiveRiskSection from './additive-risk-section.svelte'
  import AdditiveSources from './additive-sources.svelte'

  const { additive, modal = false }: { additive: Additive; modal?: boolean } = $props()
  const localizedAdditive = $derived(localizeAdditive(additive, getLocale()))
</script>

<div class:modal class="additive-details-content">
  <AdditiveHero additive={localizedAdditive} />

  <div class="detail-grid">
    <article class="detail-content">
      <AdditiveOverviewSection additive={localizedAdditive} />
      <AdditiveRiskSection additive={localizedAdditive} />
      <AdditiveJurisdictionsSection additive={localizedAdditive} />
    </article>
    <AdditiveSources additive={localizedAdditive} />
  </div>
</div>
