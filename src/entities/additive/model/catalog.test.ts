import { describe, expect, it } from 'vitest'

import { additiveRepo } from '$lib/server/additive-repo'

import { additiveCategories, additiveSlug, assessmentConclusions, jurisdictionStatuses, riskLevels } from './additive'
import { sources, sourcesById } from './sources'

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
      expect(typeof additive.assessmentReviewed).toBe('boolean')
      expect(additive.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)

      if (additive.assessmentReviewed) {
        expect(assessmentConclusions).toContain(additive.assessmentConclusion)
        expect(additive.assessmentSourceIds.length).toBeGreaterThan(0)
        expect(additive.assessmentSourceIds.every((sourceId) => sourcesById.has(sourceId))).toBe(true)
        expect(additive.sourceIds.slice(0, additive.assessmentSourceIds.length)).toEqual(additive.assessmentSourceIds)
      } else {
        expect(additive.risk).toBe('uncertain')
        expect(additive.assessmentSourceIds).toEqual([])
      }
    }
  })

  it('references only registered sources', () => {
    expect(new Set(sources.map((source) => source.id)).size).toBe(sources.length)
    expect(sources.some((source) => source.id === 'chat-report')).toBe(false)

    for (const additive of additives) {
      const sourceIds = [
        ...additive.sourceIds,
        ...additive.jurisdictions.eu.sourceIds,
        ...additive.jurisdictions.eaeu.sourceIds,
      ]

      expect(sourceIds.length).toBeGreaterThan(0)
      expect(sourceIds.every((sourceId) => sourcesById.has(sourceId))).toBe(true)
      expect(additive.sourceIds.at(-1)).toBe('wikipedia-e-number')
    }
  })

  it('keeps official assessments separate from regional legal status', () => {
    const additive171 = additives.find((additive) => additive.code === 'E171')
    const additive422 = additives.find((additive) => additive.code === 'E422')
    const additive621 = additives.find((additive) => additive.code === 'E621')
    const uncertainAssessment = additives.find((additive) => additive.code === 'E101')

    expect(additive171?.jurisdictions.eu.current).toBe('withdrawn')
    expect(additive171?.jurisdictions.eaeu.current).toBe('restricted')
    expect(additive171?.risk).toBe('avoid')
    expect(additive171?.jurisdictions.eu.sourceIds).toEqual(['eu-2022-63-e171'])

    expect(additive422?.risk).toBe('caution')
    expect(additive422?.audienceFlags).toContain('children')

    expect(additive621?.risk).toBe('limit')
    expect(additive621?.adi?.value).toBe(30)

    expect(uncertainAssessment?.assessmentReviewed).toBe(true)
    expect(uncertainAssessment?.assessmentConclusion).toBe('insufficient-data')
    expect(uncertainAssessment?.risk).toBe('uncertain')
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
      reviewedCount: 315,
      eaeuCount: additives.filter((additive) => additive.jurisdictions.eaeu.current === 'restricted').length,
    })
  })
})
