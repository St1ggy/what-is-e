import { expect, test } from '@playwright/test'

test.describe('audit regressions', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('PARAGLIDE_LOCALE', 'ru'))
  })

  test('keeps catalog semantics and restores focus after reset', async ({ page }) => {
    await page.goto('/catalog')

    await expect(page.getByRole('heading', { level: 1, name: 'Найдите код' })).toBeVisible()

    const search = page.getByLabel('Номер или название')

    await search.fill('E621')
    await page.getByRole('button', { name: 'Сбросить' }).click()
    await expect(search).toBeFocused()

    const assessment = page.getByLabel('Оценка')

    await assessment.click()
    await assessment.press('ArrowDown')

    const activeOptionId = await page.getByRole('listbox').getAttribute('aria-activedescendant')

    expect(activeOptionId).toBeTruthy()
    await expect(page.locator(`[id="${activeOptionId}"]`)).toHaveCount(1)
  })

  test('keeps a single main landmark and exposes canonical modal navigation', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Поиск добавки').fill('E621')
    await page.getByRole('link', { name: /E621:/ }).click()

    const dialog = page.getByRole('dialog')

    await expect(dialog).toBeVisible()
    await expect(page.locator('main')).toHaveCount(1)
    await expect(dialog.getByRole('link', { name: 'Открыть полную страницу' })).toHaveAttribute(
      'href',
      '/additives/e621',
    )
  })

  test('keeps compact rows readable at the tablet boundary', async ({ page }) => {
    await page.setViewportSize({ width: 621, height: 900 })
    await page.goto('/catalog')
    await page.getByRole('button', { name: 'Строки' }).click()

    const titleBox = await page.locator('.additive-card h2').first().boundingBox()

    expect(titleBox).not.toBeNull()
    expect(titleBox!.width).toBeGreaterThan(100)
    expect(await page.locator('html').evaluate((element) => element.scrollWidth)).toBeLessThanOrEqual(621)
  })

  test('contains long detail headings at the two-column boundary', async ({ page }) => {
    await page.setViewportSize({ width: 761, height: 900 })
    await page.goto('/additives/e1202')

    const heading = page.getByRole('heading', { level: 1 })
    const headingBox = await heading.boundingBox()

    expect(headingBox).not.toBeNull()
    expect(headingBox!.x + headingBox!.width).toBeLessThanOrEqual(761)
    expect(await page.locator('html').evaluate((element) => element.scrollWidth)).toBeLessThanOrEqual(761)
  })

  test('keeps the landing search usable at 320 pixels', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 })
    await page.goto('/')

    const search = page.getByLabel('Поиск добавки')

    await search.fill('e')
    await expect(page.getByRole('link', { name: /^Показать все результаты: \d+$/ })).toBeVisible()

    const [searchBox, searchContainerBox] = await Promise.all([
      search.boundingBox(),
      page.locator('.hero-search').boundingBox(),
    ])

    expect(searchBox).not.toBeNull()
    expect(searchContainerBox).not.toBeNull()
    expect(searchBox!.width).toBeGreaterThan(150)
    expect(searchContainerBox!.width).toBeGreaterThan(280)
    expect(await page.locator('html').evaluate((element) => element.scrollWidth)).toBeLessThanOrEqual(320)
  })

  test('focuses a completion status after manual pagination', async ({ page }) => {
    await page.addInitScript({
      content: `Object.defineProperty(globalThis, 'IntersectionObserver', {
        configurable: true,
        value: class {
          disconnect() { return undefined }
          observe() { return undefined }
          takeRecords() { return [] }
          unobserve() { return undefined }
        },
      })`,
    })
    await page.goto('/catalog?category=colors')

    const loadMore = page.getByRole('button', { name: /Показать ещё/ })

    for (let pageNumber = 0; pageNumber < 5 && (await loadMore.isVisible()); pageNumber += 1) {
      await loadMore.click()
    }

    await expect(page.getByText('Показаны все результаты')).toBeFocused()
  })

  test('localizes errors, offline UI and install metadata', async ({ page }) => {
    await page.goto('/missing-page')
    await expect(page.getByRole('heading', { level: 1, name: 'Страница не найдена' })).toBeVisible()

    await page.goto('/offline')
    await expect(page.getByRole('heading', { level: 1, name: 'Нет подключения к сети' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Попробовать снова' })).toBeVisible()
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest')
  })

  test('uses English metadata and synchronizes the selected theme color', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('PARAGLIDE_LOCALE', 'en'))
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1, name: 'What is E?' })).toBeVisible()
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.en.webmanifest')
    await page.getByRole('button', { name: 'Use dark theme' }).click()
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#10110f')
  })
})
