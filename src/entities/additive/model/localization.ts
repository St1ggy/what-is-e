import * as m from '@/paraglide/messages'

import {
  type Additive,
  type AdditiveCategory,
  type AudienceFlag,
  type JurisdictionStatus,
  type RiskLevel,
  type SourceReference,
} from './additive'

type Locale = 'ru' | 'en'

type CatalogMessage = (inputs?: Record<string, never>, options?: { locale?: Locale }) => string

const catalogMessages = m as unknown as Record<string, CatalogMessage | undefined>
const categoryMessages: Record<AdditiveCategory, CatalogMessage> = {
  colors: m.categoryColors,
  preservatives: m.categoryPreservatives,
  antioxidants: m.categoryAntioxidants,
  texturizers: m.categoryTexturizers,
  minerals: m.categoryMinerals,
  'flavor-enhancers': m.categoryFlavorEnhancers,
  sweeteners: m.categorySweeteners,
  other: m.categoryOther,
}
const riskMessages: Record<RiskLevel, CatalogMessage> = {
  low: m.riskLow,
  caution: m.riskCaution,
  limit: m.riskLimit,
  uncertain: m.riskUncertain,
  avoid: m.riskAvoid,
}
const catalogRiskMessages: Record<RiskLevel, CatalogMessage> = {
  low: m.catalogRiskLow,
  caution: m.catalogRiskCaution,
  limit: m.catalogRiskLimit,
  uncertain: m.catalogRiskUncertain,
  avoid: m.catalogRiskAvoid,
}
const audienceMessages: Record<AudienceFlag, CatalogMessage> = {
  allergy: m.audienceAllergy,
  asthma: m.audienceAsthma,
  children: m.audienceChildren,
  kidney: m.audienceKidney,
  pku: m.audiencePku,
  vegan: m.audienceVegan,
  digestion: m.audienceDigestion,
}
const jurisdictionStatusMessages: Record<JurisdictionStatus, CatalogMessage> = {
  allowed: m.statusAllowed,
  restricted: m.statusRestricted,
  transition: m.statusTransition,
  withdrawn: m.statusWithdrawn,
  'not-authorized': m.statusNotAuthorized,
  unknown: m.statusUnknown,
}

function getCatalogMessage(key: string, locale: Locale): string | undefined {
  return catalogMessages[key]?.({}, { locale })
}

function functionMessageKey(value: string): string {
  const suffix = value
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join('')
  let hash = 5381

  for (const character of value) hash = ((hash * 33) ^ character.codePointAt(0)!) >>> 0

  return `additiveFunction${suffix}${hash.toString(36)}`
}

function englishJurisdictionSummary(region: 'eu' | 'eaeu', status: JurisdictionStatus): string {
  const options = { locale: 'en' as const }

  if (status === 'unknown') {
    return region === 'eu' ? m.jurisdictionUnknownEu({}, options) : m.jurisdictionUnknownEaeu({}, options)
  }

  if (status === 'withdrawn') return m.jurisdictionWithdrawn({}, options)

  if (status === 'not-authorized') return m.jurisdictionNotAuthorized({}, options)

  if (status === 'transition') return m.jurisdictionTransition({}, options)

  return region === 'eu' ? m.jurisdictionListedEu({}, options) : m.jurisdictionListedEaeu({}, options)
}

export function getCategoryLabel(category: AdditiveCategory, locale: Locale): string {
  return categoryMessages[category]({}, { locale })
}

export function getRiskLabel(risk: RiskLevel, locale: Locale): string {
  return riskMessages[risk]({}, { locale })
}

export function getAudienceFlagLabel(flag: AudienceFlag, locale: Locale): string {
  return audienceMessages[flag]({}, { locale })
}

export function getJurisdictionStatusLabel(status: JurisdictionStatus, locale: Locale): string {
  return jurisdictionStatusMessages[status]({}, { locale })
}

export function localizeAdditive(additive: Additive, locale: Locale): Additive {
  const name = getCatalogMessage(`additiveName${additive.code}`, locale) ?? additive.name
  const functions = additive.functions.map((value) => getCatalogMessage(functionMessageKey(value), locale) ?? value)

  if (locale === 'ru') {
    return {
      ...additive,
      name,
      functions,
      shortDescription: additive.shortDescription.replaceAll(additive.name, () => name),
      description: additive.description.replaceAll(additive.name, () => name),
    }
  }

  const purpose = functions.length > 0 ? functions.join(', ') : getCategoryLabel(additive.category, 'en').toLowerCase()
  const options = { locale: 'en' as const }
  const shortDescription = additive.legacy
    ? m.additiveHistoricalShort({ name }, options)
    : m.additiveUsedAs({ name, purpose }, options)
  const audience = additive.audienceFlags.map((flag) => getAudienceFlagLabel(flag, 'en'))
  const extraCare = audience.length > 0 ? m.additiveExtraCare({ audience: audience.join(', ') }, options) : ''
  const riskSummary = catalogRiskMessages[additive.risk]({}, options) + extraCare

  return {
    ...additive,
    name,
    functions,
    shortDescription,
    description: additive.legacy
      ? m.additiveHistoricalDescription({ name }, options)
      : m.additiveDescription({ shortDescription }, options),
    riskSummary,
    jurisdictions: {
      eu: {
        ...additive.jurisdictions.eu,
        summary: englishJurisdictionSummary('eu', additive.jurisdictions.eu.current),
      },
      eaeu: {
        ...additive.jurisdictions.eaeu,
        summary: englishJurisdictionSummary('eaeu', additive.jurisdictions.eaeu.current),
      },
    },
  }
}

export function removeRepeatedLead(value: string, lead: string): string {
  const trimmedValue = value.trim()
  const trimmedLead = lead.trim()
  const normalizedValue = trimmedValue.replace(
    /^(?:историческая добавка|исторический e-код|historical additive|historical e-number)\s*:?\s*/iu,
    '',
  )

  if (!trimmedLead || !normalizedValue.toLocaleLowerCase().startsWith(trimmedLead.toLocaleLowerCase())) {
    return normalizedValue
  }

  const remainder = normalizedValue.slice(trimmedLead.length)

  if (remainder && !/^[\s.,:;!?—–-]/u.test(remainder)) return normalizedValue

  return remainder.replace(/^[\s.,:;!?—–-]+/u, '').trim()
}

export function localizeSource(source: SourceReference, locale: Locale): SourceReference {
  const options = { locale }
  const localized: Record<string, Pick<SourceReference, 'title' | 'organization'>> = {
    'eu-1333-2008': {
      title: m.sourceEuRegulationTitle({}, options),
      organization: 'EUR-Lex',
    },
    'eaeu-tr-ts-029-2012': {
      title: m.sourceEaeuTitle({}, options),
      organization: m.sourceEaeuOrganization({}, options),
    },
    'efsa-food-additives': {
      title: m.sourceEfsaAdditivesTitle({}, options),
      organization: m.sourceEfsaOrganization({}, options),
    },
    'efsa-e171': {
      title: m.sourceEfsaE171Title({}, options),
      organization: m.sourceEfsaOrganization({}, options),
    },
    'who-food-additives': {
      title: m.sourceWhoTitle({}, options),
      organization: m.sourceWhoOrganization({}, options),
    },
    'wikipedia-e-number': {
      title: m.sourceWikipediaTitle({}, options),
      organization: m.sourceWikipediaOrganization({}, options),
    },
    'chat-report': {
      title: m.sourceResearchTitle({}, options),
      organization: m.sourceResearchOrganization({}, options),
    },
  }

  const localizedSource = localized[source.id]

  return localizedSource ? { ...source, ...localizedSource } : source
}
