<script lang="ts">
  import { CatalogPage } from '@/pages/home'

  import type { PageProps } from './$types'

  const { data }: PageProps = $props()
</script>

<CatalogPage additives={data.additives} stats={data.stats} />
