<script lang="ts">
  import { resolve } from '$app/paths'
  import { BookOpen, LayoutGrid, Search, X } from '@lucide/svelte'
  import { tick } from 'svelte'

  import { type Additive, AdditiveCard } from '@/entities/additive'
  import * as m from '@/paraglide/messages'
  import { getLocale } from '@/paraglide/runtime'

  let {
    onSelect,
    query = $bindable(''),
    results,
  }: { onSelect: (additive: Additive) => void; query: string; results: Additive[] } = $props()
  let searchInput: HTMLInputElement
  let heroCopy: HTMLDivElement
  let layoutAnimation: Animation | undefined
  let isResultsVisible = $state(false)
  const hasResults = $derived(Boolean(query.trim() && results.length > 0))
  const catalogHref = $derived(
    query.trim() ? `${resolve('/catalog')}?q=${encodeURIComponent(query.trim())}` : resolve('/catalog'),
  )

  $effect(() => {
    if (!hasResults) {
      isResultsVisible = false

      return
    }

    const revealTimer = globalThis.setTimeout(
      () => {
        isResultsVisible = true
      },
      globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180,
    )

    return () => globalThis.clearTimeout(revealTimer)
  })

  async function updateQuery(nextQuery: string) {
    const previousPosition = heroCopy.getBoundingClientRect()

    query = nextQuery

    await tick()

    const nextPosition = heroCopy.getBoundingClientRect()
    const offset = previousPosition.top - nextPosition.top

    if (Math.abs(offset) < 1 || globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    layoutAnimation?.cancel()
    layoutAnimation = heroCopy.animate([{ transform: `translateY(${offset}px)` }, { transform: 'translateY(0)' }], {
      duration: 160,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    })
  }

  async function handleSearchInput(event: Event) {
    await updateQuery((event.currentTarget as HTMLInputElement).value)
  }

  async function clearSearch() {
    await updateQuery('')
    searchInput.focus()
  }
</script>

<section class:has-results={hasResults} class:results-visible={isResultsVisible} class="hero">
  <div class="hero-copy" bind:this={heroCopy}>
    <a class="hero-brand" href={resolve('/')} aria-label={m.brandHomeAria()}>
      <span>E</span>
      {getLocale() === 'ru' ? 'Что за E?' : 'What is E?'}
    </a>
    <h1>{m.heroTitle()} <span>E?</span></h1>
    <p class="hero-lead">{m.heroLead()}</p>

    <div class="hero-search-row">
      <label class="hero-search">
        <span class="visually-hidden">{m.heroSearchLabel()}</span>
        <Search size={22} aria-hidden="true" />
        <input
          bind:this={searchInput}
          value={query}
          type="search"
          placeholder={m.searchPlaceholder()}
          oninput={handleSearchInput}
        />
        {#if query}
          <button class="hero-search-clear" type="button" aria-label={m.clearSearch()} onclick={clearSearch}>
            <X size={18} aria-hidden="true" />
          </button>
        {/if}
      </label>

      <div class="hero-actions">
        <!-- eslint-disable svelte/no-navigation-without-resolve -- The route is resolved before the query string is appended. -->
        <a
          class="hero-icon-link hero-icon-link-catalog"
          href={catalogHref}
          aria-label={m.fullCatalog()}
          data-tooltip={m.fullCatalog()}
        >
          <LayoutGrid size={21} aria-hidden="true" />
        </a>
        <!-- eslint-enable svelte/no-navigation-without-resolve -->
        <a
          class="hero-icon-link"
          href={resolve('/methodology')}
          aria-label={m.methodology()}
          data-tooltip={m.methodology()}
        >
          <BookOpen size={21} aria-hidden="true" />
        </a>
      </div>
    </div>

    {#if query.trim() && (results.length === 0 || isResultsVisible)}
      <div class:no-results={results.length === 0} class="hero-results" aria-live="polite">
        {#if results.length > 0}
          {#each results as additive (additive.code)}
            <AdditiveCard {additive} {onSelect} />
          {/each}
        {:else}
          <p class="hero-no-results">{m.noResults()}</p>
        {/if}
      </div>
    {/if}
  </div>
</section>
