<script lang="ts">
  import { resolve } from '$app/paths'
  import { Scale } from '@lucide/svelte'

  import * as m from '@/paraglide/messages'
  import { getLocale } from '@/paraglide/runtime'

  import { getCategoryLabel, localizeAdditive, removeRepeatedLead } from '../model/localization'

  import CategoryIcon from './category-icon.svelte'
  import JurisdictionBadge from './jurisdiction-badge.svelte'
  import LegacyMarker from './legacy-marker.svelte'
  import RiskBadge from './risk-badge.svelte'

  import type { Additive } from '../model/additive'

  const { additive, onSelect }: { additive: Additive; onSelect?: (additive: Additive) => void } = $props()
  const localizedAdditive = $derived(localizeAdditive(additive, getLocale()))
  const cardDescription = $derived(
    removeRepeatedLead(localizedAdditive.shortDescription, localizedAdditive.name) ||
      localizedAdditive.functions.join(' · '),
  )
  const doseContext = $derived(
    /доз|количеств|уровн|нормир|употреблен|обычной еде/i.test(additive.riskSummary)
      ? localizedAdditive.riskSummary
      : undefined,
  )

  function handleClick(event: MouseEvent) {
    if (!onSelect || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    event.preventDefault()
    onSelect(additive)
  }
</script>

<article class:legacy-card={additive.legacy} class="additive-card risk-edge-{additive.risk}">
  <a
    class="card-link"
    href={resolve('/additives/[code]', { code: additive.slug })}
    aria-label={`${additive.code}: ${localizedAdditive.name}`}
    onclick={handleClick}
  >
    <div class="card-topline">
      <span class="category-label">
        <CategoryIcon category={additive.category} />
        {getCategoryLabel(additive.category, getLocale())}
      </span>
      {#if additive.legacy}<LegacyMarker />{/if}
    </div>
    <div class="card-identity">
      <div class="code">{additive.code}</div>
      <h2>{localizedAdditive.name}</h2>
    </div>
    <div class="card-copy">
      <p class="card-description">{cardDescription}</p>
      {#if doseContext}
        <p class="card-dose-context">
          <Scale size={16} aria-hidden="true" />
          <span><strong>{m.doseAndConditions()}:</strong> {doseContext}</span>
        </p>
      {/if}
    </div>
    <footer class="card-footer">
      <RiskBadge risk={additive.risk} compact />
      <div class="jurisdiction-row">
        <JurisdictionBadge region="eu" status={additive.jurisdictions.eu.current} />
        <JurisdictionBadge region="eaeu" status={additive.jurisdictions.eaeu.current} />
      </div>
    </footer>
  </a>
</article>
