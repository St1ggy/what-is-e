<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = {
    children: Snippet
    class?: string
    tone?: 'paper' | 'white' | 'blue' | 'yellow' | 'pink' | 'orange'
  }

  const { children, class: className = '', tone = 'white' }: Props = $props()
</script>

<div class="ui-panel ui-panel-{tone} {className}">{@render children()}</div>

<style>
  .ui-panel {
    padding: clamp(1rem, 3vw, 1.8rem);
    background: var(--panel-color);
    border: var(--border);
    border-radius: 10px;
    box-shadow: none;
  }

  .ui-panel-paper {
    --panel-color: var(--paper);
  }

  .ui-panel-white {
    --panel-color: var(--white);
  }

  .ui-panel-blue {
    --panel-color: var(--blue);
  }

  .ui-panel-yellow {
    --panel-color: var(--yellow);
  }

  .ui-panel-pink {
    --panel-color: var(--pink);
  }

  .ui-panel-orange {
    --panel-color: var(--orange);
  }
</style>
