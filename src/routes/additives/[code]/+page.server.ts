import { error } from '@sveltejs/kit'

import { additiveRepo } from '$lib/server/additive-repo'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

export const entries: EntryGenerator = async () => {
  const additives = await additiveRepo.list()

  return additives.map((additive) => ({ code: additive.slug }))
}

export const load: PageServerLoad = async ({ params }) => {
  const additive = await additiveRepo.findBySlug(params.code)

  if (!additive) error(404, 'Добавка не найдена')

  return { additive }
}
