<script lang="ts">
  import { resolve } from '$app/paths'

  import { type Additive, type SourceReference, localizeSource, sourcesById } from '@/entities/additive'
  import * as m from '@/paraglide/messages'
  import { getLocale } from '@/paraglide/runtime'
  import { Panel } from '@/shared/ui'

  const { additive }: { additive: Additive } = $props()
  const additiveSources = $derived(
    additive.sourceIds
      .map((sourceId) => sourcesById.get(sourceId))
      .filter((source): source is SourceReference => Boolean(source))
      .map((source) => localizeSource(source, getLocale())),
  )
</script>

<aside class="detail-aside">
  <Panel class="source-card">
    <p class="eyebrow">{m.checked()} {additive.reviewedAt}</p>
    <h2>{m.sources()}</h2>
    <ul>
      {#each additiveSources as source (source?.id)}
        {#if source}
          <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- External source URL. -->
          <li><a href={source.url}>{source.organization}: {source.title}</a></li>
        {/if}
      {/each}
    </ul>
  </Panel>
  <Panel class="aside-note" tone="pink">
    <strong>{m.important()}</strong>
    <p>{m.medicalDisclaimer()}</p>
    <a href={resolve('/methodology')}>{m.assessmentMethod()}</a>
  </Panel>
</aside>
