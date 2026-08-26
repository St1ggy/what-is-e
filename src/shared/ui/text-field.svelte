<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLInputAttributes } from 'svelte/elements'

  type Props = Omit<HTMLInputAttributes, 'value'> & {
    element?: HTMLInputElement
    label: string
    leading?: Snippet
    value?: string
  }

  let { element = $bindable(), label, leading, value = $bindable(''), class: className = '', ...rest }: Props = $props()
</script>

<label class="ui-field {className}">
  <span class="ui-field-label">{label}</span>
  <span class="ui-input-shell">
    {#if leading}<span class="ui-input-leading">{@render leading()}</span>{/if}
    <input bind:this={element} bind:value {...rest} />
  </span>
</label>

<style>
  .ui-field {
    display: grid;
    gap: 0.5rem;
  }

  .ui-field-label {
    color: currentcolor;
    font-size: 0.72rem;
    font-weight: 750;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    opacity: 0.66;
  }

  .ui-input-shell {
    display: flex;
    align-items: center;
    color: var(--muted);
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 9px;
    transition:
      border-color 180ms ease,
      box-shadow 180ms ease;
  }

  .ui-input-shell:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 12%, transparent);
  }

  .ui-input-leading {
    padding-inline: 1rem 0.1rem;
    color: var(--muted);
    font-weight: 500;
  }

  input {
    width: 100%;
    min-height: 3.25rem;
    padding: 0.75rem 0.9rem;
    background: transparent;
    border: 0;
    outline: 0;
    font: inherit;
    font-size: 0.95rem;
    font-weight: 650;
    color: var(--ink);
  }

  input:focus-visible {
    outline: 0;
  }
</style>
