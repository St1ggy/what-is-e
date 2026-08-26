<script lang="ts">
  import { BookOpen, Scale, ShieldCheck } from '@lucide/svelte'

  import * as m from '@/paraglide/messages'
</script>

<section class="principle-strip" aria-label={m.principles()}>
  <p><ShieldCheck size={24} aria-hidden="true" /><span>01</span>{m.principleFear()}</p>
  <p><Scale size={24} aria-hidden="true" /><span>02</span>{m.principleLaw()}</p>
  <p><BookOpen size={24} aria-hidden="true" /><span>03</span>{m.principleSources()}</p>
</section>
