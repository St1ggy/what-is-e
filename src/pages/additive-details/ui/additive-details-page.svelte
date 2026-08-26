<script lang="ts">
  import { resolve } from '$app/paths'

  import { type Additive, localizeAdditive } from '@/entities/additive'
  import * as m from '@/paraglide/messages'
  import { getLocale } from '@/paraglide/runtime'
  import { AdditiveDetailsContent } from '@/widgets/additive-details'

  const { additive }: { additive: Additive } = $props()
  const localizedAdditive = $derived(localizeAdditive(additive, getLocale()))
</script>

<svelte:head>
  <title>{additive.code} — {localizedAdditive.name} | {getLocale() === 'ru' ? 'Что за E?' : 'What is E?'}</title>
  <meta name="description" content={`${additive.code}: ${localizedAdditive.shortDescription}`} />
</svelte:head>

<div class="detail-page">
  <a class="back-link" href={resolve('/catalog')}>{m.backToCatalog()}</a>
  <AdditiveDetailsContent {additive} />
</div>
