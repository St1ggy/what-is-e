<script lang="ts">
  type Props = {
    compact?: boolean
    eyebrow?: string
    level?: 1 | 2 | 3
    title: string
  }

  const { compact = false, eyebrow, level = 2, title }: Props = $props()
</script>

<div class:compact class="ui-section-heading">
  {#if eyebrow}<p>{eyebrow}</p>{/if}
  {#if level === 1}
    <h1>{title}</h1>
  {:else if level === 2}
    <h2>{title}</h2>
  {:else}
    <h3>{title}</h3>
  {/if}
</div>

<style>
  .ui-section-heading > p {
    margin: 0 0 0.65rem;
    color: var(--accent);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .ui-section-heading > :is(h1, h2, h3) {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(2.25rem, 5vw, 4.25rem);
    font-weight: 690;
    line-height: 0.94;
    letter-spacing: -0.06em;
  }

  .ui-section-heading.compact > :is(h1, h2, h3) {
    font-size: var(--section-heading-size, clamp(2.15rem, 4vw, 3.6rem));
    line-height: 1;
  }
</style>
