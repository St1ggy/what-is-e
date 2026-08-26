import { error } from '@sveltejs/kit'

import { additives, additivesBySlug } from '@/entities/additive'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

export const entries: EntryGenerator = () => additives.map((additive) => ({ code: additive.slug }))

export const load: PageServerLoad = ({ params }) => {
  const additive = additivesBySlug.get(params.code.toLowerCase())

  if (!additive) error(404, 'Добавка не найдена')

  return { additive }
}
