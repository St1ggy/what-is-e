<script lang="ts">
  import { Microscope } from '@lucide/svelte'

  import * as m from '@/paraglide/messages'
</script>

<header class="methodology-hero">
  <div class="methodology-meta">
    <span class="methodology-icon"><Microscope size={32} aria-hidden="true" /></span>
    <p class="eyebrow">{m.methodologyEyebrow()}</p>
  </div>
  <div class="methodology-intro">
    <h1>{m.methodologyHero()}</h1>
    <p>{m.methodologyLead()}</p>
  </div>
</header>
