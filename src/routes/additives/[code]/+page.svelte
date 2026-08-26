<script lang="ts">
  import { AdditiveDetailsPage } from '@/pages/additive-details'

  const { data } = $props()
</script>

<AdditiveDetailsPage additive={data.additive} />
