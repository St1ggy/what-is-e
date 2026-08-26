<script lang="ts">
  import { type Additive, removeRepeatedLead } from '@/entities/additive'
  import * as m from '@/paraglide/messages'

  const { additive }: { additive: Additive } = $props()
  const description = $derived(removeRepeatedLead(additive.description, additive.name))
</script>

<section>
  <p class="section-number">01</p>
  <h2>{m.whatAndWhy()}</h2>
  <p class="large-copy">{description}</p>
  {#if additive.functions.length}
    <div class="function-list">
      {#each additive.functions as additiveFunction (additiveFunction)}
        <span>{additiveFunction}</span>
      {/each}
    </div>
  {/if}
</section>
