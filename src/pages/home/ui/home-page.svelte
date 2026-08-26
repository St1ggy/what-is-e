<script lang="ts">
  import { type Additive, localizeAdditive } from '@/entities/additive'
  import * as m from '@/paraglide/messages'
  import { getLocale } from '@/paraglide/runtime'
  import { Modal } from '@/shared/ui'
  import { AdditiveDetailsModal } from '@/widgets/additive-details'

  import { filterAdditives } from '../model/catalog-search'

  import HeroSection from './hero-section.svelte'

  const landingResultLimit = 48
  const searchDebounceMilliseconds = 160

  const { additives }: { additives: readonly Additive[] } = $props()
  let selectedAdditive = $state<Additive>()
  let isDetailsOpen = $state(false)
  let query = $state('')
  let settledQuery = $state('')
  const allSearchResults = $derived(
    settledQuery.trim()
      ? filterAdditives(additives, {
          query: settledQuery,
          risk: 'all',
          category: 'all',
          status: 'all',
        })
      : [],
  )
  const searchResults = $derived(allSearchResults.slice(0, landingResultLimit))
  const localizedSelectedAdditive = $derived(
    selectedAdditive ? localizeAdditive(selectedAdditive, getLocale()) : undefined,
  )

  $effect(() => {
    const nextQuery = query

    if (!nextQuery.trim()) {
      settledQuery = nextQuery

      return
    }

    const debounceTimer = globalThis.setTimeout(() => {
      settledQuery = nextQuery
    }, searchDebounceMilliseconds)

    return () => globalThis.clearTimeout(debounceTimer)
  })

  function openDetails(additive: Additive) {
    selectedAdditive = additive
    isDetailsOpen = true
  }
</script>

<svelte:head>
  <title>{m.homeTitle()}</title>
  <meta name="description" content={m.homeDescription()} />
</svelte:head>

<div class="home-page">
  <HeroSection
    bind:query
    results={searchResults}
    resultQuery={settledQuery}
    totalResults={allSearchResults.length}
    onSelect={openDetails}
  />
</div>

<Modal
  bind:open={isDetailsOpen}
  title={localizedSelectedAdditive ? `${localizedSelectedAdditive.code}: ${localizedSelectedAdditive.name}` : ''}
>
  {#if selectedAdditive}
    <AdditiveDetailsModal additive={selectedAdditive} />
  {/if}
</Modal>
