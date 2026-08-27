<script lang="ts">
  import { resolve } from '$app/paths'

  import { type AdditiveCatalogStats, methodologySources } from '@/entities/additive'
  import * as m from '@/paraglide/messages'

  import CatalogPipelineSection from './catalog-pipeline-section.svelte'
  import DataLimitationsSection from './data-limitations-section.svelte'
  import MethodologyHero from './methodology-hero.svelte'
  import RiskScaleSection from './risk-scale-section.svelte'
  import SourcesSection from './sources-section.svelte'

  const { stats }: { stats: AdditiveCatalogStats } = $props()
</script>

<svelte:head>
  <title>{m.methodologyTitle()}</title>
  <meta name="description" content={m.methodologyDescription()} />
</svelte:head>

<div class="methodology-page">
  <a class="back-link" href={resolve('/')}>{m.backHome()}</a>
  <MethodologyHero />
  <RiskScaleSection />
  <CatalogPipelineSection totalCount={stats.totalCount} reviewedCount={stats.reviewedCount} />
  <DataLimitationsSection />
  <SourcesSection sources={methodologySources} />
</div>
