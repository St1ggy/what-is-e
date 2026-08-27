import * as cheerio from 'cheerio'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { PDFParse } from 'pdf-parse'
import { format, resolveConfig } from 'prettier'

const ASSESSMENTS_PATH = path.resolve('data/official-assessments.json')
const EU_AUTHORIZATIONS_PATH = path.resolve('data/eu-authorized-additives.json')
const OUTPUT_PATH = path.resolve('src/entities/additive/api/additives.json')
const SOURCE_OUTPUT_PATH = path.resolve('src/entities/additive/api/assessment-sources.json')
const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php'
const EAEU_REGULATION_PDF = 'https://eec.eaeunion.org/upload/medialibrary/90d/P_58.pdf'

function cleanText(value) {
  return value
    .replaceAll(/\[[\w ]+\]/g, '')
    .replaceAll(/\s+/g, ' ')
    .trim()
}

function normalizeCode(value) {
  const code = value
    .replace(/^Е/i, 'E')
    .replaceAll(/\s/g, '')
    .replace(/[аА]$/, 'a')
    .replace(/[бБ]$/, 'b')
    .replace(/[сС]$/, 'c')
    .replace(/[дД]$/, 'd')
    .replace(/[еЕ]$/, 'e')
    .replace(/[фФ]$/, 'f')

  return code.toLowerCase().replace(/^e/, 'E')
}

function categoryFromCode(code) {
  const number = Number(code.match(/\d+/)?.[0] ?? 0)

  if (number < 200) return 'colors'

  if (number < 300) return 'preservatives'

  if (number < 400) return 'antioxidants'

  if (number < 500) return 'texturizers'

  if (number < 600) return 'minerals'

  if (number < 700) return 'flavor-enhancers'

  if (number >= 950 && number < 970) return 'sweeteners'

  return 'other'
}

function additiveSlug(code) {
  return code.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
}

function euSummary(status) {
  if (status === 'restricted') {
    return 'Есть в официальной базе разрешённых пищевых добавок ЕС; категории продуктов и максимальные уровни проверяются отдельно.'
  }

  if (status === 'withdrawn') return 'Исторический E-код, исключённый из актуального перечня ЕС.'

  if (status === 'not-authorized') return 'В справочном перечне указана как не разрешённая сейчас в ЕС.'

  return 'Код не найден в нормализованном снимке официальной базы ЕС; отсутствие совпадения не доказывает запрет.'
}

async function loadWikipediaRows() {
  const url = new URL(WIKIPEDIA_API)

  url.search = new URLSearchParams({
    action: 'parse',
    page: 'E number',
    prop: 'text',
    format: 'json',
    formatversion: '2',
  }).toString()
  const response = await fetch(url, { headers: { 'user-agent': 'what-e-catalog/0.0.1' } })

  if (!response.ok) throw new Error(`Wikipedia returned ${response.status}`)

  const data = await response.json()
  const $ = cheerio.load(data.parse.text)
  const rows = []

  $('table.wikitable tr').each((_, row) => {
    const cells = $(row).find('td')

    if (cells.length < 2) return

    const codeMatch = cleanText($(cells[0]).text()).match(/^E\d{3,4}[a-z]?$/i)

    if (!codeMatch) return

    const code = normalizeCode(codeMatch[0])
    const nameEn = cleanText($(cells[1]).text())
    const middle = cells
      .slice(2, -1)
      .map((__, cell) => cleanText($(cell).text()))
      .get()
      .filter(Boolean)
      .join('; ')
    const rawStatus = cells.length > 2 ? cleanText(cells.last().text()) : ''

    rows.push({ code, nameEn: nameEn || code, purpose: middle, rawStatus })
  })

  return new Map(rows.map((row) => [row.code, row])).values().toArray()
}

async function loadEaeuCodes(knownCodes) {
  const parser = new PDFParse({ url: EAEU_REGULATION_PDF })

  try {
    const result = await parser.getText()
    const candidates = result.text.match(/[ЕE]\s?\d{3,4}[a-zA-Zа-яА-Я]?/g) ?? []

    return new Set(candidates.map((candidate) => normalizeCode(candidate)).filter((code) => knownCodes.has(code)))
  } finally {
    await parser.destroy()
  }
}

const assessmentData = JSON.parse(await readFile(ASSESSMENTS_PATH, 'utf8'))
const euAuthorizationData = JSON.parse(await readFile(EU_AUTHORIZATIONS_PATH, 'utf8'))
const assessmentByCode = new Map(assessmentData.records.map((record) => [record.code, record]))
const assessmentSourcesById = new Map(assessmentData.sources.map((source) => [source.id, source]))

if (assessmentData.records.length !== 315 || assessmentByCode.size !== 315) {
  throw new Error('Official assessment manifest must contain exactly 315 unique records')
}

for (const record of assessmentData.records) {
  const expectedRisk = assessmentData.methodology.riskMapping[record.assessmentConclusion]

  if (record.risk !== expectedRisk) {
    throw new Error(`${record.code} risk does not match its official assessment conclusion`)
  }

  if (record.sourceIds.length === 0 || record.sourceIds.some((sourceId) => !assessmentSourcesById.has(sourceId))) {
    throw new Error(`${record.code} references an unknown assessment source`)
  }

  if (
    record.risk !== 'uncertain' &&
    record.sourceIds.every((sourceId) => assessmentSourcesById.get(sourceId)?.kind !== 'assessment')
  ) {
    throw new Error(`${record.code} needs a specific official assessment source`)
  }
}

if (
  euAuthorizationData.withdrawals.some((withdrawal) =>
    euAuthorizationData.entries.some((entry) => entry.code === withdrawal.code),
  )
) {
  throw new Error('EU authorization entries must not contain explicit EUR-Lex withdrawals')
}

const REVIEWED_AT = '2026-08-27'
const euWithdrawals = new Map(
  euAuthorizationData.withdrawals.map((withdrawal) => [withdrawal.code, withdrawal.sourceId]),
)
const euAuthorizedCodes = new Set(euAuthorizationData.entries.map((entry) => entry.code))
const wikipediaRows = await loadWikipediaRows()
const rowByCode = new Map(wikipediaRows.map((row) => [row.code, row]))

for (const assessment of assessmentData.records) {
  if (!rowByCode.has(assessment.code)) {
    rowByCode.set(assessment.code, {
      code: assessment.code,
      nameEn: assessment.nameEn ?? assessment.code,
      purpose: '',
      rawStatus: '',
    })
  }
}

const knownCodes = new Set(rowByCode.keys())
const eaeuCodes = await loadEaeuCodes(knownCodes)
const additives = rowByCode
  .values()
  .map((row) => {
    const assessment = assessmentByCode.get(row.code)
    let euStatus = 'unknown'

    if (euWithdrawals.has(row.code)) euStatus = 'withdrawn'
    else if (euAuthorizedCodes.has(row.code)) euStatus = 'restricted'

    const eaeuStatus = eaeuCodes.has(row.code) ? 'restricted' : 'unknown'
    const sourceIds = [
      ...(assessment?.sourceIds ?? []),
      euWithdrawals.get(row.code) ?? 'eu-food-additives-portal',
      'eaeu-tr-ts-029-2012',
      'wikipedia-e-number',
    ]

    const name = assessment?.name ?? row.nameEn
    const description = assessment
      ? `${name}. Вывод основан на указанных официальных оценках EFSA или JECFA и должен читаться вместе с разрешёнными условиями применения.`
      : `Исторический E-код: ${row.nameEn}. Отдельная официальная оценка пока не добавлена.`

    return {
      code: row.code,
      slug: additiveSlug(row.code),
      name,
      nameEn: row.nameEn === row.code ? undefined : row.nameEn,
      aliases: row.nameEn === row.code ? [] : [row.nameEn],
      category: assessment?.category ?? categoryFromCode(row.code),
      functions: row.purpose ? [row.purpose] : [],
      shortDescription: assessment?.name ?? `Историческая добавка ${row.nameEn}.`,
      description,
      commonProducts: [],
      risk: assessment?.risk ?? 'uncertain',
      riskSummary:
        assessment?.riskSummary ??
        'Отдельная официальная оценка пока не добавлена; уровень риска зависит от вещества, дозы и условий применения.',
      riskSummaryEn: assessment?.riskSummaryEn,
      audienceFlags: assessment?.audienceFlags ?? [],
      adi: assessment?.adi,
      assessmentReviewed: Boolean(assessment),
      assessmentConclusion: assessment?.assessmentConclusion,
      assessmentSourceIds: assessment?.sourceIds ?? [],
      assessmentReviewedAt: assessment?.reviewedAt,
      jurisdictions: {
        eu: {
          current: euStatus,
          summary: euSummary(euStatus),
          sourceIds: [euWithdrawals.get(row.code) ?? 'eu-food-additives-portal'],
        },
        eaeu: {
          current: eaeuStatus,
          summary:
            eaeuStatus === 'restricted'
              ? 'Упоминается в приложениях ТР ТС 029/2012; продукты и максимальные уровни зависят от категории.'
              : 'Код не найден автоматической сверкой исходного текста ТР ТС 029/2012; требуется ручная проверка.',
          sourceIds: ['eaeu-tr-ts-029-2012'],
        },
      },
      sourceIds: [...new Set(sourceIds)],
      reviewedAt: assessment?.reviewedAt ?? REVIEWED_AT,
      family: assessment?.family,
      legacy: euStatus === 'withdrawn' || euStatus === 'not-authorized',
    }
  })
  .toArray()
  .toSorted((left, right) => {
    const leftMatch = left.code.match(/^E(\d+)([a-z]*)$/i)
    const rightMatch = right.code.match(/^E(\d+)([a-z]*)$/i)

    return (
      Number(leftMatch?.[1]) - Number(rightMatch?.[1]) || (leftMatch?.[2] ?? '').localeCompare(rightMatch?.[2] ?? '')
    )
  })

const prettierConfig = await resolveConfig(OUTPUT_PATH)
const [catalogOutput, sourceOutput] = await Promise.all([
  format(JSON.stringify(additives), { ...prettierConfig, filepath: OUTPUT_PATH }),
  format(JSON.stringify(assessmentData.sources), { ...prettierConfig, filepath: SOURCE_OUTPUT_PATH }),
])

await Promise.all([writeFile(OUTPUT_PATH, catalogOutput, 'utf8'), writeFile(SOURCE_OUTPUT_PATH, sourceOutput, 'utf8')])
console.log(
  `Built ${additives.length} additives: ${assessmentByCode.size} officially reviewed, ${eaeuCodes.size} mentioned in TR TS 029/2012`,
)
