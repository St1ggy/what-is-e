<script lang="ts">
  import { BookOpen, ExternalLink, Scale, ShieldCheck } from '@lucide/svelte'

  import {
    type Additive,
    CategoryIcon,
    JurisdictionBadge,
    LegacyMarker,
    RiskBadge,
    type SourceReference,
    getAudienceFlagLabel,
    getCategoryLabel,
    localizeAdditive,
    localizeSource,
    removeRepeatedLead,
    sourcesById,
  } from '@/entities/additive'
  import * as m from '@/paraglide/messages'
  import { getLocale } from '@/paraglide/runtime'

  const { additive }: { additive: Additive } = $props()
  const localizedAdditive = $derived(localizeAdditive(additive, getLocale()))
  const description = $derived(removeRepeatedLead(localizedAdditive.description, localizedAdditive.name))
  const additiveSources = $derived(
    additive.sourceIds
      .map((sourceId) => sourcesById.get(sourceId))
      .filter((source): source is SourceReference => Boolean(source))
      .map((source) => localizeSource(source, getLocale())),
  )
</script>

<div class="modal-detail risk-surface-{additive.risk}">
  <header class="modal-header">
    <div class="modal-header-meta">
      <p class="modal-category">
        <CategoryIcon category={additive.category} />
        {getCategoryLabel(additive.category, getLocale())}
        {#if additive.legacy}<LegacyMarker />{/if}
      </p>
      <RiskBadge risk={additive.risk} />
    </div>
    <div class="modal-heading">
      <div class="modal-code">{additive.code}</div>
      <div class="modal-title">
        <h2>{localizedAdditive.name}</h2>
        {#if getLocale() === 'ru' && additive.nameEn}<p class="modal-name-en">{additive.nameEn}</p>{/if}
      </div>
    </div>
  </header>

  <main class="modal-main">
    <section class="modal-section modal-overview">
      <p class="modal-kicker"><BookOpen size={16} aria-hidden="true" /> {m.whatAndWhy()}</p>
      <p class="modal-lead">{description}</p>
      {#if localizedAdditive.functions.length}
        <div class="modal-functions">
          {#each localizedAdditive.functions as additiveFunction (additiveFunction)}
            <span>{additiveFunction}</span>
          {/each}
        </div>
      {/if}
    </section>

    <section class="modal-section modal-assessment">
      <p class="modal-kicker"><ShieldCheck size={16} aria-hidden="true" /> {m.assessment()}</p>
      <p class="modal-copy">{localizedAdditive.riskSummary}</p>
      {#if additive.audienceFlags.length}
        <div class="modal-attention">
          <strong>{m.whoShouldCare()}</strong>
          <span>{additive.audienceFlags.map((flag) => getAudienceFlagLabel(flag, getLocale())).join(' · ')}</span>
        </div>
      {/if}
    </section>

    <section class="modal-section modal-regulation">
      <p class="modal-kicker"><Scale size={16} aria-hidden="true" /> {m.regulatoryStatus()}</p>
      <div class="modal-regions">
        <div>
          <JurisdictionBadge region="eu" status={additive.jurisdictions.eu.current} />
          <p>{localizedAdditive.jurisdictions.eu.summary}</p>
        </div>
        <div>
          <JurisdictionBadge region="eaeu" status={additive.jurisdictions.eaeu.current} />
          <p>{localizedAdditive.jurisdictions.eaeu.summary}</p>
        </div>
      </div>
    </section>
  </main>

  <footer class="modal-sources">
    <span>{m.checked()} {additive.reviewedAt}</span>
    {#each additiveSources.slice(0, 3) as source (source?.id)}
      {#if source}
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- External source URL. -->
        <a href={source.url}>{source.organization} <ExternalLink size={12} aria-hidden="true" /></a>
      {/if}
    {/each}
  </footer>
</div>

<style>
  .modal-detail {
    min-width: 0;
    min-height: min(620px, calc(100dvh - 32px));
    background: var(--surface);
  }

  .modal-header {
    position: relative;
    overflow: hidden;
    display: grid;
    gap: 30px;

    padding: 34px 84px 36px 42px;
    border-top: 4px solid var(--risk-accent);

    background: linear-gradient(
      120deg,
      color-mix(in srgb, var(--risk-accent) 12%, var(--surface)) 0%,
      color-mix(in srgb, var(--risk-accent) 5%, var(--surface)) 45%,
      var(--surface) 100%
    );
  }

  .modal-header-meta {
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: space-between;
  }

  .modal-heading {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: clamp(24px, 4vw, 48px);
    align-items: end;
  }

  .modal-category,
  .modal-kicker {
    margin: 0;
    color: var(--risk-accent, var(--accent));
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.09em;
  }

  .modal-category {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }

  .modal-code {
    color: var(--risk-accent);
    font-size: clamp(4.8rem, 8vw, 6.8rem);
    font-weight: 720;
    line-height: 0.72;
    letter-spacing: -0.09em;
  }

  .modal-title {
    min-width: 0;
  }

  .modal-title h2 {
    max-width: 100%;
    margin: 0;
    font-size: clamp(1.8rem, 3.2vw, 2.8rem);
    line-height: 1;
    letter-spacing: -0.055em;
    overflow-wrap: break-word;
    hyphens: none;
  }

  .modal-name-en {
    max-width: 100%;
    margin: 10px 0 0;
    color: var(--muted);
    font-size: 0.84rem;
    overflow-wrap: anywhere;
  }

  .modal-main {
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
    min-width: 0;
  }

  .modal-section {
    display: flex;
    flex-direction: column;
    gap: 18px;

    min-width: 0;
    padding: 32px 40px 34px;
    border-top: 1px solid var(--line);
  }

  .modal-overview {
    border-right: 1px solid var(--line);
  }

  .modal-regulation {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: 160px minmax(0, 1fr);
    gap: 28px;
  }

  .modal-kicker {
    display: flex;
    gap: 8px;
    align-items: center;
    color: var(--accent);
  }

  .modal-section > p:not(.modal-kicker) {
    margin: 0;
    color: var(--muted);
    line-height: 1.65;
  }

  .modal-lead {
    font-size: clamp(1rem, 1.6vw, 1.22rem);
  }

  .modal-functions {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .modal-functions span {
    padding: 6px 9px;
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 9%, var(--surface));
    border: 1px solid color-mix(in srgb, var(--accent) 22%, var(--line));
    border-radius: 6px;
    font-size: 0.72rem;
    font-weight: 700;
  }

  .modal-attention {
    display: grid;
    gap: 5px;
    padding: 14px 16px;
    color: #4a3a03;
    background: color-mix(in srgb, #d5a900 12%, var(--surface));
    border-left: 4px solid #d5a900;
    border-radius: 8px;
  }

  .modal-attention span {
    font-size: 0.82rem;
  }

  .modal-regions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .modal-regions > div {
    padding: 16px 18px;
    border: 1px solid var(--line);
    border-radius: 12px;

    background: color-mix(in srgb, var(--risk-accent) 3%, var(--surface-raised));
  }

  .modal-regions :global(.jurisdiction) {
    width: 100%;
    font-size: 0.72rem;
  }

  .modal-regions p {
    margin: 13px 0 0;
    color: var(--muted);
    font-size: 0.8rem;
    line-height: 1.5;
  }

  .modal-sources {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    align-items: center;
    padding: 18px 40px 22px;
    color: var(--muted);
    border-top: 1px solid var(--line);
    font-size: 0.7rem;
  }

  .modal-sources a {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    color: var(--accent);
  }

  :global([data-theme='dark']) .modal-attention {
    color: #f2df9c;
    background: #45380d;
  }

  @media (max-width: 820px) {
    .modal-main {
      grid-template-columns: 1fr;
    }

    .modal-overview {
      border-right: 0;
    }

    .modal-regulation {
      grid-column: 1;
    }
  }

  @media (max-width: 620px) {
    .modal-detail {
      min-height: 100dvh;
    }

    .modal-header {
      gap: 24px;

      padding: 28px 64px 28px 22px;
    }

    .modal-header-meta {
      display: grid;
      justify-items: start;
    }

    .modal-heading {
      grid-template-columns: 1fr;
      gap: 18px;
    }

    .modal-code {
      font-size: clamp(4.2rem, 22vw, 5.8rem);
    }

    .modal-title h2 {
      font-size: clamp(1.65rem, 8vw, 2.35rem);
    }

    .modal-section {
      padding: 26px 22px 28px;
    }

    .modal-regulation {
      grid-template-columns: 1fr;
      gap: 18px;
    }

    .modal-regions {
      grid-template-columns: 1fr;
    }

    .modal-sources {
      padding: 18px 22px 26px;
    }
  }
</style>
