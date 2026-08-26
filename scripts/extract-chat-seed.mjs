import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const inputArgument = process.argv[2]

if (!inputArgument) {
  console.error('Usage: bun run data:extract -- <conversation.json> [output.json]')
  process.exit(1)
}

const outputArgument = process.argv[3] ?? 'src/entities/additive/api/chat-seed.json'

const OFFICIAL_HOSTS = new Set([
  'ec.europa.eu',
  'efsa.onlinelibrary.wiley.com',
  'eur-lex.europa.eu',
  'food.ec.europa.eu',
  'www.efsa.europa.eu',
  'www.fsai.ie',
  'www.iarc.who.int',
  'www.who.int',
])

const CATEGORY_BY_HEADING = new Map([
  ['Красители', 'colors'],
  ['Консерванты', 'preservatives'],
  ['Кислоты, антиоксиданты и регуляторы', 'antioxidants'],
  ['Загустители, желирующие вещества и эмульгаторы', 'texturizers'],
  ['Разрыхлители, соли и вещества против слёживания', 'minerals'],
  ['Усилители вкуса', 'flavor-enhancers'],
  ['Подсластители', 'sweeteners'],
  ['Глазирователи, газы, ферменты и прочие добавки', 'other'],
])

function normalizeUrl(value) {
  try {
    const url = new URL(value)

    url.searchParams.delete('utm_source')

    return url.href
  } catch {
    return null
  }
}

function expandCodeExpression(expression) {
  const normalized = expression.replaceAll(/[‑–—]/g, '-')
  const parts = normalized.split(',').map((part) => part.trim())
  const codes = []

  for (const part of parts) {
    const suffixRange = part.match(/^E(\d+)([a-z])-([a-z])$/i)

    if (suffixRange) {
      for (
        let suffix = suffixRange[2].toLowerCase().codePointAt(0) ?? 0;
        suffix <= (suffixRange[3].toLowerCase().codePointAt(0) ?? 0);
        suffix += 1
      ) {
        codes.push(`E${suffixRange[1]}${String.fromCodePoint(suffix)}`)
      }
      continue
    }

    const numericRange = part.match(/^E(\d+)-(\d+)$/i)

    if (numericRange) {
      for (let number = Number(numericRange[1]); number <= Number(numericRange[2]); number += 1) {
        codes.push(`E${number}`)
      }
      continue
    }

    if (/^E\d+[a-z]?$/i.test(part)) codes.push(part.toUpperCase().replace(/([A-Z])$/, (letter) => letter.toLowerCase()))
  }

  return codes
}

function parseRisk(assessment) {
  if (assessment.includes('⛔')) return 'avoid'

  if (assessment.includes('🟠')) return 'limit'

  if (assessment.includes('🟡')) return 'caution'

  return 'low'
}

function parseFlags(text) {
  const flags = new Set()

  if (/аллерг|чувствитель/i.test(text)) flags.add('allergy')

  if (/астм/i.test(text)) flags.add('asthma')

  if (/детск|детей/i.test(text)) flags.add('children')

  if (/поч/i.test(text)) flags.add('kidney')

  if (/фенилкетонур|ФКУ/i.test(text)) flags.add('pku')

  if (/веган|насеком/i.test(text)) flags.add('vegan')

  if (/пищевар|послаб|вздути/i.test(text)) flags.add('digestion')

  return [...flags]
}

function collectSources(message) {
  const collected = []
  const references = message.metadata?.content_references ?? []

  for (const reference of references) {
    const items = reference.items ?? []

    for (const item of items) {
      collected.push(item, ...(item.supporting_websites ?? []))
    }
  }

  const unique = new Map()

  for (const source of collected) {
    const url = normalizeUrl(source.url)

    if (!url || !OFFICIAL_HOSTS.has(new URL(url).hostname)) continue

    unique.set(url, {
      title: source.title || url,
      url,
      organization: source.attribution || new URL(url).hostname,
    })
  }

  return unique
    .values()
    .toArray()
    .toSorted((left, right) => left.url.localeCompare(right.url))
}

function parseRows(report) {
  let category = 'other'
  const entries = []

  for (const line of report.split('\n')) {
    if (line.startsWith('# ')) {
      const heading = line.slice(2).split(':', 1)[0].trim()

      category = CATEGORY_BY_HEADING.get(heading) ?? category
      continue
    }

    const cells = line.split('|').map((cell) => cell.trim())

    if (cells.length < 5 || !cells[1].startsWith('**E')) continue

    const expression = cells[1].replaceAll('**', '')
    const description = cells[2].replaceAll(/\s+/g, ' ').trim()
    const assessment = cells[3].replaceAll(/\s+/g, ' ').trim()

    for (const code of expandCodeExpression(expression)) {
      entries.push({
        code,
        category,
        seedDescription: description,
        seedAssessment: assessment,
        risk: parseRisk(assessment),
        audienceFlags: parseFlags(`${description} ${assessment}`),
        fromExpression: expression,
      })
    }
  }

  return new Map(entries.map((entry) => [entry.code, entry]))
    .values()
    .toArray()
    .toSorted((left, right) => {
      const leftMatch = left.code.match(/^E(\d+)([a-z]*)$/i)
      const rightMatch = right.code.match(/^E(\d+)([a-z]*)$/i)

      return (
        Number(leftMatch?.[1]) - Number(rightMatch?.[1]) || (leftMatch?.[2] ?? '').localeCompare(rightMatch?.[2] ?? '')
      )
    })
}

const inputPath = path.resolve(inputArgument)
const outputPath = path.resolve(outputArgument)
const conversation = JSON.parse(await readFile(inputPath, 'utf8'))
const assistantMessages = Object.values(conversation.mapping ?? {})
  .map((node) => node.message)
  .filter((message) => message?.author?.role === 'assistant' && message.content?.content_type === 'text')
const reportMessage = assistantMessages.toSorted(
  (left, right) => (right.content.parts?.[0]?.length ?? 0) - (left.content.parts?.[0]?.length ?? 0),
)[0]

if (!reportMessage?.content?.parts?.[0]) {
  throw new Error('Could not find the final assistant report')
}

const report = reportMessage.content.parts[0]
const explicitCodes = [...new Set(report.match(/E\d{3,4}[a-z]?/g))].toSorted((left, right) =>
  left.localeCompare(right, 'en'),
)
const seed = {
  conversationId: conversation.conversation_id,
  title: conversation.title,
  reportLength: report.length,
  explicitCodes,
  entries: parseRows(report),
  sources: collectSources(reportMessage),
}

await writeFile(outputPath, `${JSON.stringify(seed, null, 2)}\n`, 'utf8')
console.log(`Extracted ${seed.entries.length} candidate entries and ${seed.sources.length} sources to ${outputPath}`)
