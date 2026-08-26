<script lang="ts">
  import { Database } from '@lucide/svelte'

  import * as m from '@/paraglide/messages'
  import { SectionHeading } from '@/shared/ui'

  type Props = {
    eaeuCount: number
    researchedCount: number
    totalCount: number
  }

  const { eaeuCount, researchedCount, totalCount }: Props = $props()
</script>

<div class="catalog-heading">
  <div class="catalog-title-row">
    <span class="catalog-icon"><Database size={22} aria-hidden="true" /></span>
    <SectionHeading eyebrow={m.catalogEyebrow()} title={m.findCode()} />
  </div>
  <div class="catalog-stats" aria-label={m.catalogStats()}>
    <span><strong>{totalCount}</strong> {m.historicalCodes()}</span>
    <span><strong>{researchedCount}</strong> {m.assessedCodes()}</span>
    <span><strong>{eaeuCount}</strong> {m.eaeuCodes()}</span>
  </div>
</div>
