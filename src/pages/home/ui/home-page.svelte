<script lang="ts">
  import { type Additive, additives, localizeAdditive } from '@/entities/additive'
  import * as m from '@/paraglide/messages'
  import { getLocale } from '@/paraglide/runtime'
  import { Modal } from '@/shared/ui'
  import { AdditiveDetailsModal } from '@/widgets/additive-details'

  import { filterAdditives } from '../model/catalog-search'

  import HeroSection from './hero-section.svelte'

  let selectedAdditive = $state<Additive>()
  let isDetailsOpen = $state(false)
  let query = $state('')
  const searchResults = $derived(
    query.trim()
      ? filterAdditives(additives, {
          query,
          risk: 'all',
          category: 'all',
          status: 'all',
        })
      : [],
  )
  const localizedSelectedAdditive = $derived(
    selectedAdditive ? localizeAdditive(selectedAdditive, getLocale()) : undefined,
  )

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
  <HeroSection bind:query results={searchResults} onSelect={openDetails} />
</div>

<Modal
  bind:open={isDetailsOpen}
  title={localizedSelectedAdditive ? `${localizedSelectedAdditive.code}: ${localizedSelectedAdditive.name}` : ''}
>
  {#if selectedAdditive}
    <AdditiveDetailsModal additive={selectedAdditive} />
  {/if}
</Modal>
