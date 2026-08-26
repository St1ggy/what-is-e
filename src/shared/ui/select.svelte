<script lang="ts" generics="Value extends string">
  import { Check, ChevronDown } from '@lucide/svelte'
  import { Select } from 'melt/components'

  import type { SelectOption } from './types'

  type Props = {
    class?: string
    disabled?: boolean
    label: string
    options: readonly SelectOption<Value>[]
    value: Value
  }

  let { class: className = '', disabled = false, label, options, value = $bindable() }: Props = $props()

  const selectedLabel = $derived(options.find((option) => option.value === value)?.label ?? '')
</script>

<Select bind:value sameWidth>
  {#snippet children(select)}
    <div class="ui-select {className}">
      <label class="ui-select-label" {...select.label}>{label}</label>
      <button class="ui-select-trigger" type="button" {disabled} {...select.trigger}>
        <span>{selectedLabel}</span>
        <span aria-hidden="true" class:open={select.open}><ChevronDown size={16} /></span>
      </button>
      <div
        class="ui-select-content"
        {...select.content}
        aria-activedescendant={select.highlighted
          ? `${select.ids.content}-${select.getOptionId(select.highlighted)}`
          : undefined}
      >
        {#each options as option (option.value)}
          <div
            class="ui-select-option"
            class:selected={select.isSelected(option.value)}
            id={`${select.ids.content}-${select.getOptionId(option.value)}`}
            {...select.getOption(option.value, option.label)}
          >
            <span>{option.label}</span>
            {#if select.isSelected(option.value)}<span aria-hidden="true"><Check size={15} /></span>{/if}
          </div>
        {/each}
      </div>
    </div>
  {/snippet}
</Select>

<style>
  .ui-select {
    position: relative;
    display: grid;
    gap: 0.5rem;
    min-width: 0;
  }

  .ui-select-label {
    color: currentcolor;
    font-size: 0.72rem;
    font-weight: 750;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    opacity: 0.66;
  }

  .ui-select-trigger {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 3.375rem;
    padding: 0.7rem 0.9rem;
    overflow: hidden;
    color: var(--ink);
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 9px;
    font: inherit;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    transition:
      border-color 180ms ease,
      box-shadow 180ms ease;
  }

  .ui-select-trigger > span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ui-select-trigger > span:last-child {
    transition: transform 150ms ease;
  }

  .ui-select-trigger > span.open {
    transform: rotate(180deg);
  }

  .ui-select-trigger:focus-visible {
    border-color: var(--accent);
    outline: 0;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 12%, transparent);
  }

  .ui-select-content {
    z-index: 40;
    width: var(--melt-invoker-width);
    max-height: min(20rem, var(--melt-popover-available-height));
    margin: 0;
    padding: 0.45rem;
    overflow-y: auto;
    background: var(--white);
    border: 1px solid var(--line);
    border-radius: 10px;
    box-shadow: var(--shadow);
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
    transition:
      opacity 160ms ease,
      transform 160ms ease,
      display 160ms allow-discrete,
      overlay 160ms allow-discrete;
  }

  .ui-select-content:popover-open {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  @starting-style {
    .ui-select-content:popover-open {
      opacity: 0;
      transform: translateY(-6px) scale(0.98);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ui-select-content {
      transition: none;
    }
  }

  .ui-select-option {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 0.7rem 0.8rem;
    border-radius: 7px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
  }

  .ui-select-option[data-highlighted] {
    background: var(--surface-raised);
  }

  .ui-select-option.selected {
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 12%, var(--surface));
  }
</style>
