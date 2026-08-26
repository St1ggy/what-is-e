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

type SearchDocument = {
  code: string
  description: string
  values: string[]
}

const searchDocuments = new WeakMap<Additive, SearchDocument>()

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

function getSearchDocument(additive: Additive): SearchDocument {
  const cachedDocument = searchDocuments.get(additive)

  if (cachedDocument) return cachedDocument

  const document = {
    code: normalizeCodeQuery(additive.code),
    description: normalizeSearchValue(additive.shortDescription),
    values: [additive.name, additive.nameEn, ...additive.aliases]
      .filter((value): value is string => Boolean(value))
      .map((value) => normalizeSearchValue(value)),
  }

  searchDocuments.set(additive, document)

  return document
}

function searchScore(document: SearchDocument, query: string): number | null {
  if (!query) return 10

  const codeScore = codeSearchScore(document.code, query)

  if (codeScore !== null) return codeScore

  if (document.values.includes(query)) return 4

  if (document.values.some((value) => value.startsWith(query))) return 5

  if (document.values.some((value) => value.includes(query))) return 6

  if (document.description.includes(query)) return 7

  return null
}

export function filterAdditives(catalog: Additive[], filters: CatalogFilters): Additive[] {
  const query = normalizeCodeQuery(filters.query)
  const matches: { additive: Additive; score: number }[] = []

  for (const additive of catalog) {
    if (filters.risk !== 'all' && additive.risk !== filters.risk) continue

    if (filters.category !== 'all' && additive.category !== filters.category) continue

    if (!hasMatchingStatus(additive, filters.status)) continue

    const score = searchScore(getSearchDocument(additive), query)

    if (score !== null) matches.push({ additive, score })
  }

  return matches
    .toSorted(
      (left, right) => left.score - right.score || compareAdditiveCodes(left.additive.code, right.additive.code),
    )
    .map(({ additive }) => additive)
}
