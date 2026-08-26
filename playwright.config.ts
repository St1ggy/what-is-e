import { defineConfig } from '@playwright/test'

export default defineConfig({
  webServer: { command: 'bun run build && bun run preview', port: 4173, timeout: 600_000 },
  testMatch: '**/*.e2e.{ts,js}',
})
