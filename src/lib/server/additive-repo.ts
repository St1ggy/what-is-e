import type { Additive, AdditiveCatalogStats } from '@/entities/additive'
import rawAdditives from '@/entities/additive/api/additives.json'

export type AdditiveRepo = {
  findBySlug(slug: string): Promise<Additive | undefined>
  getStats(): Promise<AdditiveCatalogStats>
  list(): Promise<readonly Additive[]>
}

const additives = rawAdditives as Additive[]
const additivesBySlug = new Map(additives.map((additive) => [additive.slug, additive]))
const stats: AdditiveCatalogStats = {
  totalCount: additives.length,
  reviewedCount: additives.filter((additive) => additive.assessmentReviewed).length,
  eaeuCount: additives.filter((additive) => additive.jurisdictions.eaeu.current === 'restricted').length,
}

export const additiveRepo: AdditiveRepo = {
  async findBySlug(slug) {
    return additivesBySlug.get(slug.toLowerCase())
  },
  async getStats() {
    return stats
  },
  async list() {
    return additives
  },
}
