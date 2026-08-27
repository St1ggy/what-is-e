export const riskLevels = ['low', 'caution', 'limit', 'uncertain', 'avoid'] as const
export type RiskLevel = (typeof riskLevels)[number]

export const jurisdictionStatuses = [
  'allowed',
  'restricted',
  'transition',
  'withdrawn',
  'not-authorized',
  'unknown',
] as const
export type JurisdictionStatus = (typeof jurisdictionStatuses)[number]

export const additiveCategories = [
  'colors',
  'preservatives',
  'antioxidants',
  'texturizers',
  'minerals',
  'flavor-enhancers',
  'sweeteners',
  'other',
] as const
export type AdditiveCategory = (typeof additiveCategories)[number]

export const audienceFlags = ['allergy', 'asthma', 'children', 'kidney', 'pku', 'vegan', 'digestion'] as const
export type AudienceFlag = (typeof audienceFlags)[number]

export const assessmentConclusions = [
  'no-safety-concern',
  'qualified-concern',
  'exposure-concern',
  'safety-concern',
  'insufficient-data',
] as const
export type AssessmentConclusion = (typeof assessmentConclusions)[number]

export type SourceReference = {
  id: string
  title: string
  url: string
  organization: string
  kind: 'regulation' | 'assessment' | 'guidance' | 'database' | 'index'
  checkedAt: string
}

export type StatusPeriod = {
  status: JurisdictionStatus
  summary: string
  validFrom?: string
  validTo?: string
  sourceIds: string[]
}

export type RegionalStatus = {
  current: JurisdictionStatus
  summary: string
  sourceIds: string[]
  history?: StatusPeriod[]
}

export type AcceptableDailyIntake = {
  value?: number
  unit: 'mg/kg body weight/day' | 'not-specified' | 'group-adi'
  summary: string
  summaryEn?: string
  sourceIds: string[]
}

export type Additive = {
  code: string
  slug: string
  name: string
  nameEn?: string
  aliases: string[]
  category: AdditiveCategory
  functions: string[]
  shortDescription: string
  description: string
  commonProducts: string[]
  risk: RiskLevel
  riskSummary: string
  riskSummaryEn?: string
  audienceFlags: AudienceFlag[]
  adi?: AcceptableDailyIntake
  assessmentReviewed: boolean
  assessmentConclusion?: AssessmentConclusion
  assessmentSourceIds: string[]
  assessmentReviewedAt?: string
  jurisdictions: {
    eu: RegionalStatus
    eaeu: RegionalStatus
  }
  sourceIds: string[]
  reviewedAt: string
  family?: string
  legacy?: boolean
}

export type AdditiveCatalogStats = {
  eaeuCount: number
  reviewedCount: number
  totalCount: number
}

export const categoryLabels: Record<AdditiveCategory, string> = {
  colors: 'Красители',
  preservatives: 'Консерванты',
  antioxidants: 'Кислоты и антиоксиданты',
  texturizers: 'Текстура и эмульсии',
  minerals: 'Соли и разрыхлители',
  'flavor-enhancers': 'Усилители вкуса',
  sweeteners: 'Подсластители',
  other: 'Прочие добавки',
}

export const riskLabels: Record<RiskLevel, string> = {
  low: 'Низкий риск',
  caution: 'Есть оговорки',
  limit: 'Лучше ограничивать',
  uncertain: 'Данные уточняются',
  avoid: 'Высокая осторожность',
}

export const audienceFlagLabels: Record<AudienceFlag, string> = {
  allergy: 'Аллергия и индивидуальная чувствительность',
  asthma: 'Астма и чувствительность к сульфитам',
  children: 'Дети',
  kidney: 'Заболевания почек',
  pku: 'Фенилкетонурия',
  vegan: 'Веганский рацион и происхождение сырья',
  digestion: 'Чувствительное пищеварение',
}

export const jurisdictionStatusLabels: Record<JurisdictionStatus, string> = {
  allowed: 'Разрешена',
  restricted: 'Разрешена с ограничениями',
  transition: 'Переходный период',
  withdrawn: 'Исключена из перечня',
  'not-authorized': 'Не разрешена сейчас',
  unknown: 'Статус уточняется',
}

export function additiveSlug(code: string): string {
  return code.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
}

export function compareAdditiveCodes(left: string, right: string): number {
  const pattern = /^E(\d+)([a-z]*)$/i
  const leftMatch = pattern.exec(left)
  const rightMatch = pattern.exec(right)

  if (!leftMatch || !rightMatch) return left.localeCompare(right, 'en')

  const numericDifference = Number(leftMatch[1]) - Number(rightMatch[1])

  return numericDifference || leftMatch[2].localeCompare(rightMatch[2], 'en')
}
