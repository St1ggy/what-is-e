<script lang="ts">
  import * as m from '@/paraglide/messages'
  import { SectionHeading } from '@/shared/ui'

  type Props = {
    reviewedCount: number
    totalCount: number
  }

  const { reviewedCount, totalCount }: Props = $props()
</script>

<section class="method-section">
  <p class="section-number">02</p>
  <div>
    <SectionHeading compact title={m.catalogBuild()} />
    <div class="pipeline-grid">
      <div><strong>{totalCount}</strong><span>{m.individualCodes()}</span></div>
      <div><strong>{reviewedCount}</strong><span>{m.reviewedCodes()}</span></div>
      <div><strong>2</strong><span>{m.regulatorySystems()}</span></div>
    </div>
    <ol class="method-list">
      <li>{m.pipelineOne()}</li>
      <li>{m.pipelineTwo()}</li>
      <li>{m.pipelineThree()}</li>
      <li>{m.pipelineFour()}</li>
    </ol>
  </div>
</section>
