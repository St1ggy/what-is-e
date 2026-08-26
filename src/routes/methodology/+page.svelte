<script lang="ts">
  import { MethodologyPage } from '@/pages/methodology'

  import type { PageProps } from './$types'

  const { data }: PageProps = $props()
</script>

<MethodologyPage stats={data.stats} />
