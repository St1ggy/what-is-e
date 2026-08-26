<script lang="ts">
  import { browser } from '$app/environment'
  import { afterNavigate, replaceState } from '$app/navigation'

  import {
    type Additive,
    type AdditiveCategory,
    type RiskLevel,
    additiveCategories,
    additives,
    riskLevels,
  } from '@/entities/additive'

  import { type CatalogStatusFilter, catalogStatusFilters, filterAdditives } from '../model/catalog-search'

  import CatalogFilters from './catalog-filters.svelte'
  import CatalogHeading from './catalog-heading.svelte'
  import CatalogResults from './catalog-results.svelte'

  let { onSelect, query = $bindable('') }: { onSelect: (additive: Additive) => void; query?: string } = $props()

  let risk = $state<RiskLevel | 'all'>('all')
  let category = $state<AdditiveCategory | 'all'>('all')
  let status = $state<CatalogStatusFilter>('all')
  let visibleCount = $state(48)
  let isHydrated = $state(false)

  const results = $derived(filterAdditives(additives, { query, risk, category, status }))
  const researchedCount = additives.filter((additive) => additive.risk !== 'uncertain').length
  const eaeuCount = additives.filter((additive) => additive.jurisdictions.eaeu.current === 'restricted').length

  afterNavigate(() => {
    if (isHydrated) return

    const parameters = new URLSearchParams(globalThis.location.search)
    const initialRisk = parameters.get('risk')
    const initialCategory = parameters.get('category')
    const initialStatus = parameters.get('status')

    query = parameters.get('q') ?? ''
    risk = riskLevels.includes(initialRisk as RiskLevel) ? (initialRisk as RiskLevel) : 'all'
    category = additiveCategories.includes(initialCategory as AdditiveCategory)
      ? (initialCategory as AdditiveCategory)
      : 'all'
    status = catalogStatusFilters.includes(initialStatus as CatalogStatusFilter)
      ? (initialStatus as CatalogStatusFilter)
      : 'all'
    isHydrated = true
  })

  $effect(() => {
    visibleCount = 48

    if (!browser || !isHydrated) return

    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- This URL is a local snapshot rebuilt by the effect.
    const url = new URL(globalThis.location.href)

    url.search = ''

    if (query) url.searchParams.set('q', query)

    if (risk !== 'all') url.searchParams.set('risk', risk)

    if (category !== 'all') url.searchParams.set('category', category)

    if (status !== 'all') url.searchParams.set('status', status)

    // eslint-disable-next-line svelte/no-navigation-without-resolve -- Reuses the current route and only updates its filters.
    replaceState(url, {})
  })

  function resetFilters() {
    query = ''
    risk = 'all'
    category = 'all'
    status = 'all'
  }
</script>

<section class="catalog-section" id="catalog">
  <CatalogHeading totalCount={additives.length} {researchedCount} {eaeuCount} />
  <CatalogFilters bind:query bind:risk bind:category bind:status onReset={resetFilters} />
  <CatalogResults bind:visibleCount {results} onReset={resetFilters} {onSelect} />
</section>
