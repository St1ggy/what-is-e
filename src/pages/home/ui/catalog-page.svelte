<script lang="ts">
  import { resolve } from '$app/paths'

  import { type Additive, localizeAdditive } from '@/entities/additive'
  import * as m from '@/paraglide/messages'
  import { getLocale } from '@/paraglide/runtime'
  import { Modal } from '@/shared/ui'
  import { AdditiveDetailsModal } from '@/widgets/additive-details'

  import AdditiveCatalog from './additive-catalog.svelte'

  let selectedAdditive = $state<Additive>()
  let isDetailsOpen = $state(false)
  const localizedSelectedAdditive = $derived(
    selectedAdditive ? localizeAdditive(selectedAdditive, getLocale()) : undefined,
  )

  function openDetails(additive: Additive) {
    selectedAdditive = additive
    isDetailsOpen = true
  }
</script>

<svelte:head>
  <title>{m.catalog()} | {getLocale() === 'ru' ? 'Что за E?' : 'What is E?'}</title>
  <meta name="description" content={m.homeDescription()} />
</svelte:head>

<div class="catalog-page">
  <a class="back-link" href={resolve('/')}>{m.backHome()}</a>
  <AdditiveCatalog onSelect={openDetails} />
</div>

<Modal
  bind:open={isDetailsOpen}
  title={localizedSelectedAdditive ? `${localizedSelectedAdditive.code}: ${localizedSelectedAdditive.name}` : ''}
>
  {#if selectedAdditive}
    <AdditiveDetailsModal additive={selectedAdditive} />
  {/if}
</Modal>
