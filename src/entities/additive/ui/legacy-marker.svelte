<script lang="ts">
  import { Archive } from '@lucide/svelte'

  import * as m from '@/paraglide/messages'

  const { corner = false, label = m.legacyCode() }: { corner?: boolean; label?: string } = $props()
</script>

<span class:corner class="legacy-marker" role="img" aria-label={label} data-tooltip={label}>
  <Archive size={17} aria-hidden="true" />
</span>

<style>
  .legacy-marker {
    position: relative;
    display: inline-grid;
    flex: 0 0 auto;
    place-items: center;
    width: 30px;
    height: 30px;
    color: var(--card-accent, var(--risk-accent, var(--muted)));
    background: color-mix(in srgb, currentcolor 7%, transparent);
    border: 1px solid color-mix(in srgb, currentcolor 38%, var(--line));
    border-radius: 7px;
    cursor: help;
  }

  .legacy-marker.corner {
    position: absolute;
  }

  .legacy-marker::after {
    pointer-events: none;
    content: attr(data-tooltip);
    position: absolute;
    z-index: 60;
    top: calc(100% + 8px);
    right: 0;
    width: max-content;
    max-width: 190px;
    padding: 6px 8px;
    color: var(--paper);
    background: var(--ink);
    border-radius: 6px;
    box-shadow: var(--shadow-soft);
    font-size: 0.7rem;
    font-weight: 650;
    line-height: 1.3;
    text-transform: none;
    letter-spacing: 0;
    visibility: hidden;
    opacity: 0;
    transform: translateY(-4px);
    transition:
      opacity 150ms ease,
      transform 150ms ease,
      visibility 150ms ease;
  }

  .legacy-marker:hover::after {
    visibility: visible;
    opacity: 1;
    transform: translateY(0);
  }
</style>
