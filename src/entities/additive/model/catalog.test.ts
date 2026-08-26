import { describe, expect, it } from 'vitest'

import { additiveRepo } from '$lib/server/additive-repo'

import { additiveCategories, additiveSlug, jurisdictionStatuses, riskLevels } from './additive'
import { sourcesById } from './sources'

const additives = await additiveRepo.list()

describe('historical additive catalog', () => {
  it('contains the complete historical index as individual entries', () => {
    expect(additives.length).toBeGreaterThanOrEqual(500)
    expect(new Set(additives.map((additive) => additive.code)).size).toBe(additives.length)
    expect(new Set(additives.map((additive) => additive.slug)).size).toBe(additives.length)
    expect(additives.every((additive) => /^E\d{3,4}[a-z]?$/.test(additive.code))).toBe(true)
  })

  it('keeps required fields and enum values valid', () => {
    for (const additive of additives) {
      expect(additive.slug).toBe(additiveSlug(additive.code))
      expect(additive.name.length).toBeGreaterThan(0)
      expect(additive.shortDescription.length).toBeGreaterThan(0)
      expect(additive.description.length).toBeGreaterThan(0)
      expect(additiveCategories).toContain(additive.category)
      expect(riskLevels).toContain(additive.risk)
      expect(jurisdictionStatuses).toContain(additive.jurisdictions.eu.current)
      expect(jurisdictionStatuses).toContain(additive.jurisdictions.eaeu.current)
      expect(additive.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('references only registered sources', () => {
    for (const additive of additives) {
      const sourceIds = [
        ...additive.sourceIds,
        ...additive.jurisdictions.eu.sourceIds,
        ...additive.jurisdictions.eaeu.sourceIds,
      ]

      expect(sourceIds.length).toBeGreaterThan(0)
      expect(sourceIds.every((sourceId) => sourcesById.has(sourceId))).toBe(true)
    }
  })

  it('preserves the researched examples and regional differences', () => {
    const additive171 = additives.find((additive) => additive.code === 'E171')
    const additive621 = additives.find((additive) => additive.code === 'E621')

    expect(additive171?.jurisdictions.eu.current).toBe('withdrawn')
    expect(additive171?.jurisdictions.eaeu.current).toBe('restricted')
    expect(additive621?.risk).toBe('caution')
  })

  it('exposes lookup and aggregate data through the repository contract', async () => {
    const [additive621, missingAdditive, stats] = await Promise.all([
      additiveRepo.findBySlug('E621'),
      additiveRepo.findBySlug('missing'),
      additiveRepo.getStats(),
    ])

    expect(additive621?.code).toBe('E621')
    expect(missingAdditive).toBeUndefined()
    expect(stats).toEqual({
      totalCount: additives.length,
      researchedCount: additives.filter((additive) => additive.risk !== 'uncertain').length,
      eaeuCount: additives.filter((additive) => additive.jurisdictions.eaeu.current === 'restricted').length,
    })
  })
})
