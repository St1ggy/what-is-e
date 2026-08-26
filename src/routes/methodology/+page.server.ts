import { additiveRepo } from '$lib/server/additive-repo'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => ({ stats: await additiveRepo.getStats() })
