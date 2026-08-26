<script lang="ts">
  import { getLocale } from '@/paraglide/runtime'

  import { getJurisdictionStatusLabel } from '../model/localization'

  import type { JurisdictionStatus } from '../model/additive'

  const {
    region,
    status,
  }: {
    region: 'eu' | 'eaeu'
    status: JurisdictionStatus
  } = $props()

  const regionLabel = $derived.by(() => {
    if (region === 'eu') return getLocale() === 'ru' ? 'ЕС' : 'EU'

    return getLocale() === 'ru' ? 'ЕАЭС' : 'EAEU'
  })
</script>

<span class="jurisdiction jurisdiction-{status}">
  <strong>{regionLabel}</strong>
  <span>{getJurisdictionStatusLabel(status, getLocale())}</span>
</span>
