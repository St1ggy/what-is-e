import { additiveRepo } from '$lib/server/additive-repo'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => ({ additives: await additiveRepo.list() })
