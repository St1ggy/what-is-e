import { additiveRepo } from '$lib/server/additive-repo'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const [additives, stats] = await Promise.all([additiveRepo.list(), additiveRepo.getStats()])

  return { additives, stats }
}
