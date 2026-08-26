<script lang="ts">
  import { RiskBadge, type RiskLevel, riskLevels } from '@/entities/additive'
  import * as m from '@/paraglide/messages'
  import { Panel, SectionHeading } from '@/shared/ui'

  const descriptions = $derived<Record<RiskLevel, string>>({
    low: m.riskLowDescription(),
    caution: m.riskCautionDescription(),
    limit: m.riskLimitDescription(),
    uncertain: m.riskUncertainDescription(),
    avoid: m.riskAvoidDescription(),
  })
</script>

<section class="method-section">
  <p class="section-number">01</p>
  <div>
    <SectionHeading compact title={m.fiveLevels()} />
    <div class="risk-scale">
      {#each riskLevels as risk, index (risk)}
        <Panel class="risk-scale-item">
          <span class="risk-scale-index">0{index + 1}</span>
          <RiskBadge {risk} />
          <p>{descriptions[risk]}</p>
        </Panel>
      {/each}
    </div>
    <p class="method-note">{m.scaleDisclaimer()}</p>
  </div>
</section>
