<script lang="ts">
  import { type SourceReference, localizeSource } from '@/entities/additive'
  import * as m from '@/paraglide/messages'
  import { getLocale } from '@/paraglide/runtime'
  import { SectionHeading } from '@/shared/ui'

  const { sources }: { sources: readonly SourceReference[] } = $props()
  const localizedSources = $derived(sources.map((source) => localizeSource(source, getLocale())))
  const kindLabels = $derived({
    regulation: m.sourceKindRegulation(),
    assessment: m.sourceKindAssessment(),
    guidance: m.sourceKindGuidance(),
    database: m.sourceKindDatabase(),
    index: m.sourceKindIndex(),
  })
</script>

<section class="method-section sources-section">
  <p class="section-number">04</p>
  <div>
    <SectionHeading compact title={m.primarySources()} />
    <div class="source-grid">
      {#each localizedSources as source (source.id)}
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- External source URL. -->
        <a class="source-link" href={source.url}>
          <span>{source.organization}</span>
          <strong>{source.title}</strong>
          <small>{kindLabels[source.kind]} · {m.sourceChecked()} {source.checkedAt}</small>
        </a>
      {/each}
    </div>
  </div>
</section>
