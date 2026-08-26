import type { Additive, AdditiveCategory, JurisdictionStatus, RiskLevel } from '@/entities/additive'
import { compareAdditiveCodes } from '@/entities/additive'

export const catalogStatusFilters = ['all', 'eu-listed', 'eaeu-listed', 'legacy', 'unverified'] as const

export type CatalogStatusFilter = (typeof catalogStatusFilters)[number]

export type CatalogFilters = {
  query: string
  risk: RiskLevel | 'all'
  category: AdditiveCategory | 'all'
  status: CatalogStatusFilter
}

const listedStatuses = new Set<JurisdictionStatus>(['allowed', 'restricted', 'transition'])

export function normalizeSearchValue(value: string): string {
  return value
    .normalize('NFKD')
    .replaceAll(/[Ее]/g, 'e')
    .toLowerCase()
    .replaceAll(/[^a-zа-я0-9]+/g, ' ')
    .trim()
}

export function normalizeCodeQuery(value: string): string {
  const normalized = normalizeSearchValue(value).replaceAll(/\s+/g, '')

  if (/^\d{3,4}[a-z]?$/.test(normalized)) return `e${normalized}`

  return normalized
}

function hasMatchingStatus(additive: Additive, status: CatalogStatusFilter): boolean {
  if (status === 'all') return true

  if (status === 'eu-listed') return listedStatuses.has(additive.jurisdictions.eu.current)

  if (status === 'eaeu-listed') return listedStatuses.has(additive.jurisdictions.eaeu.current)

  if (status === 'legacy') return additive.legacy === true

  return (
    additive.risk === 'uncertain' ||
    additive.jurisdictions.eu.current === 'unknown' ||
    additive.jurisdictions.eaeu.current === 'unknown'
  )
}

function codeSearchScore(code: string, query: string): number | null {
  const codeFragment = /^e?(\d+[a-z]?)$/.exec(query)?.[1]

  if (codeFragment) {
    const codeBody = code.slice(1)

    if (codeBody === codeFragment) return 0

    if (codeBody.startsWith(codeFragment)) return 1

    if (codeBody.startsWith(`1${codeFragment}`)) return 2

    if (codeBody.includes(codeFragment)) return 3

    return null
  }

  if (code === query) return 0

  if (code.startsWith(query)) return 1

  return code.includes(query) ? 3 : null
}

function searchScore(additive: Additive, query: string): number | null {
  if (!query) return 10

  const codeScore = codeSearchScore(normalizeCodeQuery(additive.code), query)

  if (codeScore !== null) return codeScore

  const values = [additive.name, additive.nameEn, ...additive.aliases]
    .filter((value): value is string => Boolean(value))
    .map((value) => normalizeSearchValue(value))

  if (values.includes(query)) return 4

  if (values.some((value) => value.startsWith(query))) return 5

  if (values.some((value) => value.includes(query))) return 6

  if (normalizeSearchValue(additive.shortDescription).includes(query)) return 7

  return null
}

export function filterAdditives(catalog: Additive[], filters: CatalogFilters): Additive[] {
  const query = normalizeCodeQuery(filters.query)

  return catalog
    .map((additive) => ({ additive, score: searchScore(additive, query) }))
    .filter(
      (result): result is { additive: Additive; score: number } =>
        result.score !== null &&
        (filters.risk === 'all' || result.additive.risk === filters.risk) &&
        (filters.category === 'all' || result.additive.category === filters.category) &&
        hasMatchingStatus(result.additive, filters.status),
    )
    .toSorted(
      (left, right) => left.score - right.score || compareAdditiveCodes(left.additive.code, right.additive.code),
    )
    .map(({ additive }) => additive)
}
