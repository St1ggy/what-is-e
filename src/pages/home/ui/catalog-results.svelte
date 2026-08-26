<script lang="ts">
  import { Grid2x2, Rows3 } from '@lucide/svelte'

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
  const visibleResults = $derived(results.slice(0, visibleCount))

  function loadNextPage() {
    visibleCount = Math.min(visibleCount + pageSize, results.length)
  }

  function setViewMode(mode: 'cards' | 'rows') {
    viewMode = mode
  }

  function loadWhenVisible(node: HTMLElement) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) loadNextPage()
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
  <div class="results-summary" aria-live="polite">
    <p>{m.shown()}: <strong>{visibleResults.length}</strong> {m.of()} {results.length}</p>
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
        <Button class="load-more" onclick={loadNextPage}>
          {m.showMore()}
          {Math.min(pageSize, results.length - visibleCount)}
        </Button>
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
