<script lang="ts">
  import { type Additive, getAudienceFlagLabel } from '@/entities/additive'
  import * as m from '@/paraglide/messages'
  import { getLocale } from '@/paraglide/runtime'
  import { Panel } from '@/shared/ui'

  const { additive }: { additive: Additive } = $props()
</script>

<section>
  <p class="section-number">02</p>
  <h2>{m.howToReadRisk()}</h2>
  <p class="large-copy">{additive.riskSummary}</p>
  {#if additive.audienceFlags.length}
    <Panel class="attention-box" tone="yellow">
      <strong>{m.whoShouldCare()}</strong>
      <p>{additive.audienceFlags.map((flag) => getAudienceFlagLabel(flag, getLocale())).join(' · ')}</p>
    </Panel>
  {/if}
</section>
