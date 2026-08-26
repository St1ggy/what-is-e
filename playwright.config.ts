import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  webServer: { command: 'bun run build && bun run preview', port: 4173, timeout: 600_000 },
  testMatch: '**/*.e2e.{ts,js}',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'firefox-audit',
      testMatch: '**/audit.e2e.{ts,js}',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit-audit',
      testMatch: '**/audit.e2e.{ts,js}',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chromium-audit',
      testMatch: '**/audit.e2e.{ts,js}',
      use: { ...devices['Pixel 5'] },
    },
  ],
})
