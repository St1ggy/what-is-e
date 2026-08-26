<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = {
    children: Snippet
    class?: string
    compact?: boolean
    tone?: 'neutral' | 'positive' | 'warning' | 'danger' | 'info' | 'orange'
  }

  const { children, class: className = '', compact = false, tone = 'neutral' }: Props = $props()
</script>

<span class:compact class="ui-badge ui-badge-{tone} {className}">{@render children()}</span>

<style>
  .ui-badge {
    display: inline-flex;
    gap: 0.4rem;
    align-items: center;
    width: fit-content;
    padding: 0.38rem 0.58rem;
    background: var(--badge-color, var(--white));
    border: 1px solid color-mix(in srgb, currentcolor 18%, transparent);
    border-radius: 6px;
    font-size: 0.74rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .ui-badge.compact {
    padding: 0.38rem 0.6rem;
    font-size: 0.7rem;
  }

  .ui-badge-positive {
    --badge-color: var(--lime);
  }

  .ui-badge-neutral {
    --badge-color: var(--surface-raised);
  }

  .ui-badge-warning {
    --badge-color: var(--yellow);
  }

  .ui-badge-danger {
    --badge-color: var(--pink);
  }

  .ui-badge-info {
    --badge-color: var(--blue);
  }

  .ui-badge-orange {
    --badge-color: var(--orange);
  }
</style>
