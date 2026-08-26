<script lang="ts">
  import { Grid2x2, Rows3 } from '@lucide/svelte'
  import { tick } from 'svelte'

  import { type Additive, AdditiveCard } from '@/entities/additive'
  import * as m from '@/paraglide/messages'
  import { Button } from '@/shared/ui'

  type Props = {
    onReset: () => void
    onSelect: (additive: Additive) => void
    results: Additive[]
    visibleCount: number
  }

  const pageSize = 48

  let { onReset, onSelect, results, visibleCount = $bindable() }: Props = $props()
  let viewMode = $state<'cards' | 'rows'>('cards')
  let paginationStatus = $state<HTMLParagraphElement>()
  let isPaginationStatusVisible = $state(false)
  const visibleResults = $derived(results.slice(0, visibleCount))

  $effect(() => {
    if (visibleCount < results.length) isPaginationStatusVisible = false
  })

  async function loadNextPage(shouldFocusStatus = false) {
    visibleCount = Math.min(visibleCount + pageSize, results.length)

    if (shouldFocusStatus && visibleCount >= results.length) {
      isPaginationStatusVisible = true
      await tick()
      paginationStatus?.focus()
    }
  }

  function setViewMode(mode: 'cards' | 'rows') {
    viewMode = mode
  }

  function loadWhenVisible(node: HTMLElement) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void loadNextPage()
      },
      { rootMargin: '600px 0px' },
    )

    observer.observe(node)

    return {
      destroy: () => observer.disconnect(),
    }
  }
</script>

<div class="catalog-results">
  <div class="results-summary">
    <p aria-live="polite">{m.shown()}: <strong>{visibleResults.length}</strong> {m.of()} {results.length}</p>
    <div class="results-summary-actions">
      <p>{m.riskStatusNote()}</p>
      <div class="view-switch" role="group" aria-label={m.viewMode()}>
        <button
          class:active={viewMode === 'cards'}
          type="button"
          aria-label={m.cardView()}
          aria-pressed={viewMode === 'cards'}
          title={m.cardView()}
          onclick={() => setViewMode('cards')}
        >
          <Grid2x2 size={19} aria-hidden="true" />
        </button>
        <button
          class:active={viewMode === 'rows'}
          type="button"
          aria-label={m.rowView()}
          aria-pressed={viewMode === 'rows'}
          title={m.rowView()}
          onclick={() => setViewMode('rows')}
        >
          <Rows3 size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>

  {#if results.length}
    <div class:view-cards={viewMode === 'cards'} class:view-rows={viewMode === 'rows'} class="card-grid">
      {#each visibleResults as additive (additive.code)}
        <AdditiveCard {additive} {onSelect} />
      {/each}
    </div>
    {#if visibleCount < results.length}
      <div class="load-more-sentinel" use:loadWhenVisible>
        <Button class="load-more" onclick={() => void loadNextPage(true)}>
          {m.showMore()}
          {Math.min(pageSize, results.length - visibleCount)}
        </Button>
      </div>
    {:else if isPaginationStatusVisible}
      <div class="load-more-sentinel">
        <p class="pagination-status" bind:this={paginationStatus} tabindex="-1">{m.allResultsShown()}</p>
      </div>
    {/if}
  {:else}
    <div class="empty-state">
      <strong>{m.noResults()}</strong>
      <p>{m.noResultsHint()}</p>
      <Button onclick={onReset}>{m.resetFilters()}</Button>
    </div>
  {/if}
</div>
