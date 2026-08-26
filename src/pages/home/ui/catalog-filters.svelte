<script lang="ts">
  import { RotateCcw, Search, SlidersHorizontal } from '@lucide/svelte'

  import {
    type AdditiveCategory,
    type RiskLevel,
    additiveCategories,
    getCategoryLabel,
    getRiskLabel,
    riskLevels,
  } from '@/entities/additive'
  import * as m from '@/paraglide/messages'
  import { getLocale } from '@/paraglide/runtime'
  import { Button, Select, type SelectOption, TextField } from '@/shared/ui'

  import type { CatalogStatusFilter } from '../model/catalog-search'

  type Props = {
    category: AdditiveCategory | 'all'
    onReset: () => void
    query: string
    risk: RiskLevel | 'all'
    status: CatalogStatusFilter
  }

  let {
    category = $bindable(),
    onReset,
    query = $bindable(),
    risk = $bindable(),
    status = $bindable(),
  }: Props = $props()

  const riskOptions = $derived<SelectOption<RiskLevel | 'all'>[]>([
    { value: 'all', label: m.anyAssessment() },
    ...riskLevels.map((value) => ({ value, label: getRiskLabel(value, getLocale()) })),
  ])
  const categoryOptions = $derived<SelectOption<AdditiveCategory | 'all'>[]>([
    { value: 'all', label: m.allCategories() },
    ...additiveCategories.map((value) => ({ value, label: getCategoryLabel(value, getLocale()) })),
  ])
  const statusOptions = $derived<SelectOption<CatalogStatusFilter>[]>([
    { value: 'all', label: m.anyStatus() },
    { value: 'eu-listed', label: m.euListed() },
    { value: 'eaeu-listed', label: m.eaeuListed() },
    { value: 'legacy', label: m.legacyCodes() },
    { value: 'unverified', label: m.needsReview() },
  ])
  const canReset = $derived(query.trim() !== '' || risk !== 'all' || category !== 'all' || status !== 'all')
</script>

<div class="search-panel">
  <div class="filter-panel-heading">
    <SlidersHorizontal size={18} aria-hidden="true" />
    <strong>{m.catalog()}</strong>
  </div>
  <TextField bind:value={query} label={m.searchLabel()} placeholder={m.searchPlaceholder()} type="search">
    {#snippet leading()}<Search size={20} aria-hidden="true" />{/snippet}
  </TextField>

  <div class:can-reset={canReset} class="filter-grid">
    <Select bind:value={risk} label={m.assessment()} options={riskOptions} />
    <Select bind:value={category} label={m.category()} options={categoryOptions} />
    <Select bind:value={status} label={m.regulatoryStatus()} options={statusOptions} />
    <div class="reset-slot">
      <Button
        aria-hidden={!canReset}
        aria-label={m.reset()}
        class="reset-button"
        disabled={!canReset}
        onclick={onReset}
        tabindex={canReset ? 0 : -1}
        title={m.reset()}
        variant="ghost"
      >
        <RotateCcw size={18} aria-hidden="true" />
      </Button>
    </div>
  </div>
</div>
