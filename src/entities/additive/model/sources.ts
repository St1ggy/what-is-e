import type { SourceReference } from './additive'

export const sources = [
  {
    id: 'eu-1333-2008',
    title: 'Regulation (EC) No 1333/2008 on food additives',
    url: 'https://eur-lex.europa.eu/eli/reg/2008/1333/oj/eng',
    organization: 'EUR-Lex',
    kind: 'regulation',
    checkedAt: '2026-08-25',
  },
  {
    id: 'eaeu-tr-ts-029-2012',
    title: 'ТР ТС 029/2012 и перечень изменений',
    url: 'https://eec.eaeunion.org/comission/department/deptexreg/tr/bezopPischDobavok.php',
    organization: 'Евразийская экономическая комиссия',
    kind: 'regulation',
    checkedAt: '2026-08-25',
  },
  {
    id: 'efsa-food-additives',
    title: 'Food additives: assessments and re-evaluations',
    url: 'https://www.efsa.europa.eu/en/topics/topic/food-additives',
    organization: 'European Food Safety Authority',
    kind: 'assessment',
    checkedAt: '2026-08-25',
  },
  {
    id: 'efsa-e171',
    title: 'Titanium dioxide: E171 no longer considered safe as a food additive',
    url: 'https://www.efsa.europa.eu/en/news/titanium-dioxide-e171-no-longer-considered-safe-when-used-food-additive',
    organization: 'European Food Safety Authority',
    kind: 'assessment',
    checkedAt: '2026-08-25',
  },
  {
    id: 'who-food-additives',
    title: 'Food additives fact sheet',
    url: 'https://www.who.int/news-room/fact-sheets/detail/food-additives',
    organization: 'World Health Organization',
    kind: 'guidance',
    checkedAt: '2026-08-25',
  },
  {
    id: 'wikipedia-e-number',
    title: 'E number: historical index and names',
    url: 'https://en.wikipedia.org/wiki/E_number',
    organization: 'Wikipedia contributors',
    kind: 'seed',
    checkedAt: '2026-08-25',
  },
  {
    id: 'chat-report',
    title: 'Сохранённое исследование «Список добавок E»',
    url: 'https://chatgpt.com/share/6a8da38b-6ac8-83eb-9aeb-8e9470016597',
    organization: 'Пользовательский исследовательский материал',
    kind: 'seed',
    checkedAt: '2026-08-25',
  },
] satisfies SourceReference[]

export const sourcesById = new Map(sources.map((source) => [source.id, source]))
