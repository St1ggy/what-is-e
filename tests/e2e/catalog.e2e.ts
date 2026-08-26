import { type Locator, expect, test } from '@playwright/test'

async function waitForAnimations(locator: Locator) {
  await locator.evaluateAll((elements) =>
    Promise.all(
      elements.flatMap((element) => element.getAnimations({ subtree: true }).map((animation) => animation.finished)),
    ),
  )
}

async function getFontSize(locator: Locator) {
  const fontSize = await locator.evaluate((element) => getComputedStyle(element).fontSize)

  return Number(fontSize.slice(0, -2))
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('PARAGLIDE_LOCALE', 'ru'))
})

test('searches a code and opens its details in a modal', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Что за E?' })).toBeVisible()

  await page.getByLabel('Поиск добавки').fill('Е 621')
  await expect(page.locator('.additive-card')).toHaveCount(1)
  await page.getByRole('link', { name: /E621:/ }).click()

  const dialog = page.getByRole('dialog')

  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { name: 'Глутамат натрия, MSG', exact: true })).toBeVisible()
  await expect(dialog.getByText('ЕАЭС', { exact: true }).first()).toBeVisible()
  await expect(page).not.toHaveURL(/\/additives\/e621$/)
})

test('keeps long additive names inside the modal header', async ({ page }) => {
  await page.goto('/catalog?q=E1404')
  await page.getByRole('link', { name: /E1404:/ }).click()

  const title = page.locator('.modal-title')
  const heading = title.getByRole('heading', { name: 'Модифицированные крахмалы, загустители и стабилизаторы' })
  const [titleBox, headingBox] = await Promise.all([title.boundingBox(), heading.boundingBox()])

  expect(titleBox).not.toBeNull()
  expect(headingBox).not.toBeNull()
  expect(headingBox!.x).toBeGreaterThanOrEqual(titleBox!.x)
  expect(headingBox!.x + headingBox!.width).toBeLessThanOrEqual(titleBox!.x + titleBox!.width + 1)
})

test('keeps the additive URL as a direct navigation fallback', async ({ page }) => {
  await page.goto('/additives/e621')

  await expect(page).toHaveURL(/\/additives\/e621$/)
  await expect(page.getByRole('heading', { name: 'Глутамат натрия, MSG' })).toBeVisible()
})

test('keeps the footer at the viewport edge only for short content', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await page.getByLabel('Поиск добавки').fill('451')
  await expect(page.locator('.hero-results .additive-card')).toHaveCount(2)

  const shortPageFooter = (await page.locator('.site-footer').boundingBox())!

  expect(shortPageFooter.y + shortPageFooter.height).toBeCloseTo(1000, 0)

  await page.goto('/catalog')

  const longPageFooter = (await page.locator('.site-footer').boundingBox())!

  expect(longPageFooter.y).toBeGreaterThanOrEqual(1000)
})

test('spans the catalog icon across both heading lines', async ({ page }) => {
  await page.goto('/catalog')

  const [iconBox, headingBox, glyphBox] = await Promise.all([
    page.locator('.catalog-icon').boundingBox(),
    page.locator('.catalog-title-row .ui-section-heading').boundingBox(),
    page.locator('.catalog-icon svg').boundingBox(),
  ])

  expect(iconBox).not.toBeNull()
  expect(headingBox).not.toBeNull()
  expect(glyphBox).not.toBeNull()
  expect(iconBox!.height).toBeCloseTo(headingBox!.height, 0)
  expect(iconBox!.width).toBeGreaterThanOrEqual(64)
  expect(glyphBox!.width).toBeGreaterThanOrEqual(40)
})

test('combines filters and keeps them in the URL', async ({ page }) => {
  await page.goto('/catalog')
  const resetButton = page.getByRole('button', { name: 'Сбросить' })

  await expect(resetButton).toBeHidden()
  await page.getByLabel('Оценка').click()
  await waitForAnimations(page.getByRole('listbox'))
  const triggerBox = await page.getByLabel('Оценка').boundingBox()
  const optionsBox = await page.getByRole('listbox').boundingBox()

  expect(optionsBox!.x).toBeCloseTo(triggerBox!.x, 0)
  expect(optionsBox!.y).toBeGreaterThanOrEqual(triggerBox!.y + triggerBox!.height)

  await expect(page.getByRole('listbox')).toHaveCSS('transition-duration', '0.16s, 0.16s, 0.16s, 0.16s')
  await page.getByRole('option', { name: 'Низкий риск' }).click()
  await expect(resetButton).toBeVisible()
  await expect(resetButton).toHaveText('')
  await page.getByLabel('Категория').click()
  await page.getByRole('option', { name: 'Красители' }).click()
  await page.getByLabel('Регуляторный статус').click()
  await page.getByRole('option', { name: 'В перечне ЕАЭС' }).click()

  await expect(page).toHaveURL(/risk=low/)
  await expect(page).toHaveURL(/category=colors/)
  await expect(page).toHaveURL(/status=eaeu-listed/)
  await expect(page.locator('.additive-card').first()).toBeVisible()
})

test('stays usable on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await expect(page.getByLabel('Поиск добавки')).toBeVisible()
  await page.getByLabel('Поиск добавки').fill('E171')
  const historicalCard = page.locator('.additive-card')

  await expect(page.getByRole('link', { name: /E171:/ })).toBeVisible()
  await expect(historicalCard).toHaveClass(/legacy-card/)
  await expect(historicalCard).toHaveClass(/risk-edge-avoid/)
  await expect(historicalCard.locator('.card-link')).toHaveCSS('opacity', '0.58')
  const historicalMarker = historicalCard.getByRole('img', { name: 'Исторический код' })

  await expect(historicalMarker).toBeVisible()
  await expect(historicalMarker).toHaveAttribute('data-tooltip', 'Исторический код')
})

test('animates the search layout and keeps an empty result compact', async ({ page }) => {
  await page.goto('/')
  const heroCopy = page.locator('.hero-copy')
  const searchRow = page.locator('.hero-search-row')
  const searchInput = page.getByLabel('Поиск добавки')

  await waitForAnimations(heroCopy)
  const expansionState = await searchInput.evaluate(async (element) => {
    const input = element as HTMLInputElement
    const footer = document.querySelector<HTMLElement>('.site-footer')!
    const footerTopBeforeSearch = footer.getBoundingClientRect().y

    input.value = '45'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

    return {
      cardCount: document.querySelectorAll('.hero-results .additive-card').length,
      footerTopBeforeSearch,
      footerTopDuringExpansion: footer.getBoundingClientRect().y,
    }
  })

  expect(expansionState.cardCount).toBe(0)
  expect(Math.abs(expansionState.footerTopDuringExpansion - expansionState.footerTopBeforeSearch)).toBeLessThan(1)
  await expect
    .poll(
      () =>
        searchRow.evaluate((element) =>
          element
            .getAnimations()
            .some((animation) => animation instanceof CSSTransition && animation.transitionProperty === 'width'),
        ),
      { intervals: [20] },
    )
    .toBe(true)

  await waitForAnimations(searchRow)
  await expect(page.locator('.hero-results .additive-card')).not.toHaveCount(0)
  const activeSearchTop = (await searchRow.boundingBox())!.y

  await searchInput.fill('3123')

  const emptyState = page.locator('.hero-no-results')

  await expect(emptyState).toBeVisible()
  expect((await searchRow.boundingBox())!.y).toBeCloseTo(activeSearchTop, 0)
  await expect(emptyState).toHaveCSS('border-top-style', 'none')
  expect((await emptyState.boundingBox())!.height).toBeLessThan(40)
})

test('keeps the landing search expanded while focused or populated', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  const heroCopy = page.locator('.hero-copy')
  const heroLead = page.locator('.hero-lead')
  const heroTitle = page.getByRole('heading', { name: 'Что за E?' })
  const searchRow = page.locator('.hero-search-row')
  const searchInput = page.getByLabel('Поиск добавки')

  await waitForAnimations(heroCopy)
  const initialWidth = (await searchRow.boundingBox())!.width
  const initialTop = (await searchRow.boundingBox())!.y
  const initialTitleSize = await getFontSize(heroTitle)

  await searchInput.focus()
  await expect.poll(async () => (await searchRow.boundingBox())!.width).toBeGreaterThan(initialWidth + 100)
  await waitForAnimations(heroCopy)
  const expandedWidth = (await searchRow.boundingBox())!.width
  const expandedTop = (await searchRow.boundingBox())!.y
  const expandedTitleSize = await getFontSize(heroTitle)

  await expect(heroLead).toHaveCSS('opacity', '0')
  expect(expandedTop).toBeLessThan(initialTop - 100)
  expect(expandedTitleSize).toBeLessThan(initialTitleSize)
  expect(expandedTitleSize).toBeGreaterThanOrEqual(54)

  await searchInput.fill('45')
  await expect(page.locator('.hero-results .additive-card')).not.toHaveCount(0)
  expect((await searchRow.boundingBox())!.width).toBeCloseTo(expandedWidth, 0)

  await searchInput.fill('')
  expect((await searchRow.boundingBox())!.width).toBeCloseTo(expandedWidth, 0)

  await heroTitle.click()
  await expect.poll(async () => (await searchRow.boundingBox())!.width).toBeCloseTo(initialWidth, 0)
  await expect(heroLead).toHaveCSS('opacity', '1')
  expect(await getFontSize(heroTitle)).toBeCloseTo(initialTitleSize, 0)
})

test('loads catalog cards in batches', async ({ page }) => {
  await page.goto('/catalog')

  const cards = page.locator('.additive-card')

  await expect(cards).toHaveCount(48)
  await page.locator('.load-more-sentinel').scrollIntoViewIfNeeded()
  await expect(cards).toHaveCount(96)
})

test('uses the landing search to open the filtered catalog', async ({ page }) => {
  await page.goto('/')

  await page.getByLabel('Поиск добавки').fill('E621')
  await page.locator('.hero-icon-link-catalog').click()

  await expect(page).toHaveURL(/q=E621/)
  await expect(page).toHaveURL(/\/catalog/)
  await expect(page.locator('.additive-card')).toHaveCount(1)
})

test('keeps search result cards equal and aligned to the grid', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await page.getByLabel('Поиск добавки').fill('пропил')

  const cards = page.locator('.additive-card')

  await expect(cards).toHaveCount(3)
  await expect(cards.locator('.card-dose-context')).toHaveCount(3)
  await waitForAnimations(cards)

  const boxes = await cards.evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect()

      return { x: box.x, y: box.y, width: Math.round(box.width), height: Math.round(box.height) }
    }),
  )

  expect(new Set(boxes.map(({ width }) => width)).size).toBe(1)
  expect(new Set(boxes.map(({ height }) => height)).size).toBe(1)
  expect(new Set(boxes.map(({ y }) => y)).size).toBe(1)
  expect(boxes[1]!.x).toBeGreaterThan(boxes[0]!.x)
  expect(boxes[2]!.x).toBeGreaterThan(boxes[1]!.x)
  await expect(cards.locator('.card-arrow')).toHaveCount(0)
})

test('shows every partial code match within the landing result batch', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await page.getByLabel('Поиск добавки').fill('45')

  await expect(page.locator('.hero-results .additive-card')).toHaveCount(11)
  await expect(page.getByRole('link', { name: /E450:/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /E1450:/ })).toBeVisible()

  const columns = await page
    .locator('.hero-results')
    .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' '))

  expect(columns).toHaveLength(3)
})

test('limits a broad landing search to one result batch', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Поиск добавки').fill('e')

  await expect(page.locator('.hero-results .additive-card')).toHaveCount(48)
})

test('switches the catalog between three-column cards and compact rows', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/catalog')

  const grid = page.locator('.card-grid')
  const cards = grid.locator('.additive-card')

  await expect(grid).toHaveClass(/view-cards/)
  await waitForAnimations(cards)

  const firstRowY = await cards.evaluateAll((elements) =>
    elements.slice(0, 4).map((element) => element.getBoundingClientRect().y),
  )

  expect(new Set(firstRowY.slice(0, 3)).size).toBe(1)
  expect(firstRowY[3]).toBeGreaterThan(firstRowY[0]!)

  await page.getByRole('button', { name: 'Строки' }).click()
  await expect(grid).toHaveClass(/view-rows/)

  const rowWidths = await cards.evaluateAll((elements) =>
    elements.slice(0, 2).map((element) => element.getBoundingClientRect().width),
  )

  expect(rowWidths[0]).toBe(rowWidths[1])
  expect(rowWidths[0]).toBeGreaterThan(1000)
})

test('keeps long modal titles readable and places sources after its content', async ({ page }) => {
  await page.goto('/catalog?q=E150a')
  await page.getByRole('link', { name: /E150a:/ }).click()

  const dialog = page.getByRole('dialog')
  const heading = dialog.getByRole('heading', { name: 'Различные карамельные красители', exact: true })
  const main = dialog.locator('.modal-main')
  const sources = dialog.locator('.modal-sources')
  const [headingBox, titleBox, mainBox, sourcesBox] = await Promise.all([
    heading.boundingBox(),
    dialog.locator('.modal-title').boundingBox(),
    main.boundingBox(),
    sources.boundingBox(),
  ])

  expect(headingBox!.x + headingBox!.width).toBeLessThanOrEqual(titleBox!.x + titleBox!.width + 1)
  expect(sourcesBox!.y).toBeGreaterThanOrEqual(mainBox!.y + mainBox!.height - 1)
})

test('uses semantic icons for every methodology risk level', async ({ page }) => {
  await page.goto('/methodology')

  const iconClasses = await page
    .locator('.risk-scale .ui-badge svg')
    .evaluateAll((icons) => icons.map((icon) => icon.getAttribute('class')))

  expect(iconClasses).toEqual([
    expect.stringContaining('lucide-shield-check'),
    expect.stringContaining('lucide-info'),
    expect.stringContaining('lucide-gauge'),
    expect.stringContaining('lucide-circle-question-mark'),
    expect.stringContaining('lucide-octagon-alert'),
  ])
})

test('exposes installable PWA metadata', async ({ page, request }) => {
  await page.goto('/')

  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest')
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', /\/pwa-192\.png$/)

  const manifestResponse = await request.get('/manifest.webmanifest')
  const manifest = await manifestResponse.json()

  expect(manifest.display).toBe('standalone')
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ sizes: '192x192', type: 'image/png' }),
      expect.objectContaining({ sizes: '512x512', type: 'image/png' }),
    ]),
  )
})
