import rawAdditives from '../api/additives.json'

import type { Additive } from './additive'

export const additives = rawAdditives as Additive[]
export const additivesBySlug = new Map(additives.map((additive) => [additive.slug, additive]))
export const additivesByCode = new Map(additives.map((additive) => [additive.code, additive]))
