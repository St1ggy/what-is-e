<script lang="ts">
  import { HomePage } from '@/pages/home'

  import type { PageProps } from './$types'

  const { data }: PageProps = $props()
</script>

<HomePage additives={data.additives} />
