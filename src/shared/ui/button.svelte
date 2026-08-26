<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'

  type Props = HTMLButtonAttributes & {
    children: Snippet
    variant?: 'primary' | 'secondary' | 'ghost'
  }

  const { children, variant = 'primary', class: className = '', ...rest }: Props = $props()
</script>

<button class="ui-button ui-button-{variant} {className}" {...rest}>
  {@render children()}
</button>

<style>
  .ui-button {
    display: inline-flex;
    gap: 0.75rem;
    align-items: center;
    justify-content: center;
    min-height: 2.9rem;
    padding: 0.65rem 1rem;
    border: 1px solid transparent;
    border-radius: 9px;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    transition: 160ms ease;
  }

  .ui-button:hover {
    transform: translateY(-1px);
  }

  .ui-button:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--accent) 35%, transparent);
    outline-offset: 2px;
  }

  .ui-button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .ui-button-primary {
    color: var(--paper);
    background: var(--ink);
  }

  .ui-button-primary:hover {
    color: var(--surface);
    background: var(--accent);
  }

  .ui-button-secondary {
    background: var(--white);
    border-color: var(--line);
    color: var(--ink);
  }

  .ui-button-secondary:hover {
    border-color: var(--line-strong);
    background: var(--surface-raised);
  }

  .ui-button-ghost {
    background: transparent;
    color: var(--ink);
  }

  .ui-button-ghost:hover {
    background: color-mix(in srgb, currentcolor 8%, transparent);
  }
</style>
