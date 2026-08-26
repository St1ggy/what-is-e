<script lang="ts">
  import { type Additive, JurisdictionBadge } from '@/entities/additive'
  import * as m from '@/paraglide/messages'

  const { additive }: { additive: Additive } = $props()
</script>

<section>
  <p class="section-number">03</p>
  <h2>{m.statusInSystems()}</h2>
  <div class="region-cards">
    <div>
      <JurisdictionBadge region="eu" status={additive.jurisdictions.eu.current} />
      <p class="region-copy">{additive.jurisdictions.eu.summary}</p>
    </div>
    <div>
      <JurisdictionBadge region="eaeu" status={additive.jurisdictions.eaeu.current} />
      <p class="region-copy">{additive.jurisdictions.eaeu.summary}</p>
    </div>
  </div>
  <p class="fine-print">{m.legalFinePrint()}</p>
</section>
