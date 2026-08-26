<script lang="ts">
  import { AppShell } from '@/app/layout'
  import { getLocale } from '@/paraglide/runtime'
  import { favicon } from '@/shared/brand'
  import '@/shared/theme/index.css'
  import '@/app/styles.css'

  const { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <link rel="manifest" href={getLocale() === 'ru' ? '/manifest.webmanifest' : '/manifest.en.webmanifest'} />
  <link rel="apple-touch-icon" href="/pwa-192.png" />
  <meta name="application-name" content={getLocale() === 'ru' ? 'Что за E?' : 'What is E?'} />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content={getLocale() === 'ru' ? 'Что за E?' : 'What is E?'} />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="theme-color" content="#f7f7f4" />
</svelte:head>

<AppShell {children} />
