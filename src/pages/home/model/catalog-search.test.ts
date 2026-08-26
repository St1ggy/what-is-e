import { describe, expect, it } from 'vitest'

import { additives, localizeAdditive } from '@/entities/additive'

import { filterAdditives, normalizeCodeQuery, normalizeSearchValue } from './catalog-search'

const defaults = {
  query: '',
  risk: 'all' as const,
  category: 'all' as const,
  status: 'all' as const,
}

describe('catalog search', () => {
  it('normalizes Latin and Cyrillic code queries', () => {
    expect(normalizeCodeQuery('621')).toBe('e621')
    expect(normalizeCodeQuery('E 621')).toBe('e621')
    expect(normalizeCodeQuery('Е-621')).toBe('e621')
    expect(normalizeSearchValue('Лимонная кислота')).toBe('лимонная кислота')
  })

  it('puts an exact E-code match first', () => {
    const result = filterAdditives(additives, { ...defaults, query: '621' })

    expect(result[0]?.code).toBe('E621')
  })

  it('matches short numeric fragments anywhere in an E-code', () => {
    const exact = filterAdditives(additives, { ...defaults, query: '451' })
    const partial = filterAdditives(additives, { ...defaults, query: '45' })

    expect(exact[0]?.code).toBe('E451')
    expect(partial[0]?.code).toBe('E450')
    expect(partial.map((additive) => additive.code)).toContain('E450')
    expect(partial.map((additive) => additive.code)).toContain('E1450')
    expect(partial.findIndex((additive) => additive.code === 'E1450')).toBeLessThan(
      partial.findIndex((additive) => additive.code === 'E345'),
    )
  })

  it('searches Russian and English names', () => {
    expect(filterAdditives(additives, { ...defaults, query: 'куркумин' })[0]?.code).toBe('E100')
    expect(filterAdditives(additives, { ...defaults, query: 'curcumin' })[0]?.code).toBe('E100')
  })

  it('combines risk, category, and regional filters', () => {
    const result = filterAdditives(additives, {
      query: '',
      risk: 'low',
      category: 'colors',
      status: 'eaeu-listed',
    })

    expect(result.length).toBeGreaterThan(0)
    expect(result.every((additive) => additive.risk === 'low')).toBe(true)
    expect(result.every((additive) => additive.category === 'colors')).toBe(true)
    expect(result.every((additive) => additive.jurisdictions.eaeu.current === 'restricted')).toBe(true)
  })

  it('can isolate historical and unverified records', () => {
    const legacy = filterAdditives(additives, { ...defaults, status: 'legacy' })
    const unverified = filterAdditives(additives, { ...defaults, status: 'unverified' })

    expect(legacy.some((additive) => additive.code === 'E171')).toBe(true)
    expect(unverified.length).toBeGreaterThan(legacy.length)
  })

  it('has a Cyrillic display name for every additive in Russian', () => {
    const untranslatedCodes = additives
      .map((additive) => localizeAdditive(additive, 'ru'))
      .filter((additive) => !/[А-Яа-яЁё]/.test(additive.name))
      .map((additive) => additive.code)

    expect(untranslatedCodes).toEqual([])
  })

  it('localizes every catalog name and function through both locales', () => {
    const russianAdditives = additives.map((additive) => localizeAdditive(additive, 'ru'))
    const englishAdditives = additives.map((additive) => localizeAdditive(additive, 'en'))
    const untranslatedRussianFunctions = russianAdditives.flatMap((additive) =>
      additive.functions.filter((value) => !/[А-Яа-яЁё]/.test(value)).map(() => additive.code),
    )
    const untranslatedEnglishNames = englishAdditives
      .filter((additive) => /[А-Яа-яЁё]/.test(additive.name))
      .map((additive) => additive.code)

    expect(untranslatedRussianFunctions).toEqual([])
    expect(untranslatedEnglishNames).toEqual([])
  })
})
