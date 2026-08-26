import * as cheerio from 'cheerio'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { PDFParse } from 'pdf-parse'

const SEED_PATH = path.resolve('src/entities/additive/api/chat-seed.json')
const OUTPUT_PATH = path.resolve('src/entities/additive/api/additives.json')
const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php'
const EAEU_REGULATION_PDF = 'https://eec.eaeunion.org/upload/medialibrary/90d/P_58.pdf'
const REVIEWED_AT = '2026-08-25'

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

function normalizeEuStatus(rawStatus) {
  const status = rawStatus.toLowerCase()

  if (/no longer approved|approval withdrawn|withdrawn/.test(status)) return 'withdrawn'

  if (/not approved in the eu|forbidden in the eu|banned in the eu/.test(status)) return 'not-authorized'

  if (/restricted use approved in the eu/.test(status)) return 'restricted'

  if (/approved in the eu/.test(status)) return 'restricted'

  return 'unknown'
}

function euSummary(status, rawStatus) {
  if (status === 'restricted') {
    return 'Указана как разрешённая в ЕС; продукты и максимальные уровни зависят от категории.'
  }

  if (status === 'withdrawn') return 'Исторический E-код, исключённый из актуального перечня ЕС.'

  if (status === 'not-authorized') return 'В справочном перечне указана как не разрешённая сейчас в ЕС.'

  return rawStatus
    ? `Текущий статус требует сверки с EUR-Lex. Справочная пометка: ${rawStatus}`
    : 'Текущий статус требует сверки с актуальной редакцией законодательства ЕС.'
}

function riskSummary(seed) {
  const summary = seed?.seedAssessment
    .replaceAll(/[🟢🟡🟠⛔]/gu, '')
    .replace(/^[/\s;]+/, '')
    .trim()

  if (summary) return summary

  if (seed?.risk === 'low') return 'Низкий риск для большинства людей при обычном употреблении.'

  return 'Отдельная оценка риска в исходном исследовании отсутствует; важны доза и условия применения.'
}

function russianName(seed, nameEn) {
  if (!seed) return nameEn

  return seed.seedDescription.split(/\.\s/, 1)[0].replace(/\.$/, '').trim() || nameEn
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

const seed = JSON.parse(await readFile(SEED_PATH, 'utf8'))
const seedByCode = new Map(seed.entries.map((entry) => [entry.code, entry]))
const wikipediaRows = await loadWikipediaRows()
const rowByCode = new Map(wikipediaRows.map((row) => [row.code, row]))

for (const seedEntry of seed.entries) {
  if (!rowByCode.has(seedEntry.code)) {
    rowByCode.set(seedEntry.code, {
      code: seedEntry.code,
      nameEn: seedEntry.code,
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
    const seedEntry = seedByCode.get(row.code)
    let euStatus = seedEntry ? 'restricted' : normalizeEuStatus(row.rawStatus)

    if (seedEntry?.risk === 'avoid') euStatus = 'withdrawn'

    if (row.code === 'E171' || row.code === 'E203') euStatus = 'withdrawn'

    const eaeuStatus = eaeuCodes.has(row.code) ? 'restricted' : 'unknown'
    const sourceIds = ['wikipedia-e-number']

    if (seedEntry) sourceIds.push('chat-report', 'efsa-food-additives')

    if (euStatus !== 'unknown') sourceIds.push('eu-1333-2008')

    if (eaeuStatus !== 'unknown') sourceIds.push('eaeu-tr-ts-029-2012')

    if (row.code === 'E171') sourceIds.push('efsa-e171')

    const name = russianName(seedEntry, row.nameEn)
    const description = seedEntry
      ? `${seedEntry.seedDescription}. Оценку следует читать вместе с разрешёнными дозами и категорией продукта.`
      : `Исторический E-код: ${row.nameEn}. Для него пока нет отдельной оценки в исходном исследовании.`

    return {
      code: row.code,
      slug: additiveSlug(row.code),
      name,
      nameEn: row.nameEn === row.code ? undefined : row.nameEn,
      aliases: row.nameEn === row.code ? [] : [row.nameEn],
      category: seedEntry?.category ?? categoryFromCode(row.code),
      functions: row.purpose ? [row.purpose] : [],
      shortDescription: seedEntry?.seedDescription ?? `Историческая добавка ${row.nameEn}.`,
      description,
      commonProducts: [],
      risk: seedEntry?.risk ?? 'uncertain',
      riskSummary: riskSummary(seedEntry),
      audienceFlags: seedEntry?.audienceFlags ?? [],
      jurisdictions: {
        eu: {
          current: euStatus,
          summary: euSummary(euStatus, row.rawStatus),
          sourceIds: euStatus === 'unknown' ? ['wikipedia-e-number'] : ['eu-1333-2008', 'wikipedia-e-number'],
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
      reviewedAt: REVIEWED_AT,
      family: seedEntry?.fromExpression === row.code ? undefined : seedEntry?.fromExpression,
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

await writeFile(OUTPUT_PATH, `${JSON.stringify(additives, null, 2)}\n`, 'utf8')
console.log(
  `Built ${additives.length} additives: ${seedByCode.size} researched, ${eaeuCodes.size} mentioned in TR TS 029/2012`,
)
