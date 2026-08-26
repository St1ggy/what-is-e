<script lang="ts">
  import { CircleQuestionMark, Gauge, Info, OctagonAlert, ShieldCheck } from '@lucide/svelte'

  import { getLocale } from '@/paraglide/runtime'
  import { Badge } from '@/shared/ui'

  import { getRiskLabel } from '../model/localization'

  import type { RiskLevel } from '../model/additive'

  const { risk, compact = false }: { risk: RiskLevel; compact?: boolean } = $props()

  const icons = {
    low: ShieldCheck,
    caution: Info,
    limit: Gauge,
    uncertain: CircleQuestionMark,
    avoid: OctagonAlert,
  }
  const RiskIcon = $derived(icons[risk])

  const tones: Record<RiskLevel, 'positive' | 'warning' | 'danger' | 'neutral' | 'orange'> = {
    low: 'positive',
    caution: 'warning',
    limit: 'orange',
    uncertain: 'neutral',
    avoid: 'danger',
  }
</script>

<Badge class="risk-{risk}" {compact} tone={tones[risk]}>
  <RiskIcon size={compact ? 14 : 17} strokeWidth={2.3} aria-hidden="true" />
  {getRiskLabel(risk, getLocale())}
</Badge>
