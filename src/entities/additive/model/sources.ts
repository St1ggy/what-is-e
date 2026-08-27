import rawAssessmentSources from '../api/assessment-sources.json'

import type { SourceReference } from './additive'

const catalogSources = [
  {
    id: 'eu-food-additives-portal',
    title: 'European Commission Food Additives Database',
    url: 'https://ec.europa.eu/food/food-feed-portal/screen/food-additives/search',
    organization: 'European Commission',
    kind: 'database',
    checkedAt: '2026-08-27',
  },
  {
    id: 'eu-1333-2008',
    title: 'Regulation (EC) No 1333/2008 on food additives',
    url: 'https://eur-lex.europa.eu/eli/reg/2008/1333/oj/eng',
    organization: 'EUR-Lex',
    kind: 'regulation',
    checkedAt: '2026-08-27',
  },
  {
    id: 'eu-2022-63-e171',
    title: 'Regulation (EU) 2022/63 removing titanium dioxide (E171) from the Union list',
    url: 'https://eur-lex.europa.eu/eli/reg/2022/63/oj/eng',
    organization: 'EUR-Lex',
    kind: 'regulation',
    checkedAt: '2026-08-27',
  },
  {
    id: 'eu-2018-98-e203',
    title: 'Regulation (EU) 2018/98 removing calcium sorbate (E203) from the Union list',
    url: 'https://eur-lex.europa.eu/eli/reg/2018/98/oj/eng',
    organization: 'EUR-Lex',
    kind: 'regulation',
    checkedAt: '2026-08-27',
  },
  {
    id: 'eaeu-tr-ts-029-2012',
    title: 'ТР ТС 029/2012 и перечень изменений',
    url: 'https://eec.eaeunion.org/comission/department/deptexreg/tr/bezopPischDobavok.php',
    organization: 'Евразийская экономическая комиссия',
    kind: 'regulation',
    checkedAt: '2026-08-27',
  },
  {
    id: 'efsa-food-additives',
    title: 'Food additives: assessments and re-evaluations',
    url: 'https://www.efsa.europa.eu/en/topics/topic/food-additives',
    organization: 'European Food Safety Authority',
    kind: 'assessment',
    checkedAt: '2026-08-27',
  },
  {
    id: 'who-food-additives',
    title: 'Food additives fact sheet',
    url: 'https://www.who.int/news-room/fact-sheets/detail/food-additives',
    organization: 'World Health Organization',
    kind: 'guidance',
    checkedAt: '2026-08-27',
  },
  {
    id: 'wikipedia-e-number',
    title: 'E number: historical index and names',
    url: 'https://en.wikipedia.org/wiki/E_number',
    organization: 'Wikipedia contributors',
    kind: 'index',
    checkedAt: '2026-08-27',
  },
] satisfies SourceReference[]

const assessmentSources = rawAssessmentSources as SourceReference[]

export const sources = [...catalogSources, ...assessmentSources]
export const sourcesById = new Map(sources.map((source) => [source.id, source]))
export const methodologySources = sources.filter((source) =>
  [
    'eu-food-additives-portal',
    'eu-1333-2008',
    'eaeu-tr-ts-029-2012',
    'efsa-food-additives',
    'efsa-openfoodtox',
    'who-jecfa-database',
    'who-food-additives',
    'wikipedia-e-number',
  ].includes(source.id),
)
