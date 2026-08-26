<script lang="ts">
  import * as m from '@/paraglide/messages'
  import { Panel, SectionHeading } from '@/shared/ui'
</script>

<section class="method-section">
  <p class="section-number">03</p>
  <div>
    <SectionHeading compact title={m.unknownMeaning()} />
    <p class="large-copy">{m.unknownExplanation()}</p>
    <Panel class="warning-banner" tone="orange">
      <strong>{m.catalogWarning()}</strong>
      <span>{m.catalogWarningDetail()}</span>
    </Panel>
  </div>
</section>
