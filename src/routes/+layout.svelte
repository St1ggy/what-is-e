<script lang="ts">
  import { AppShell } from '@/app/layout'
  import { favicon } from '@/shared/brand'
  import '@/shared/theme/index.css'
  import '@/app/styles.css'

  const { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="apple-touch-icon" href="/pwa-192.png" />
  <meta name="application-name" content="Что за E?" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Что за E?" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="theme-color" content="#f7f1e3" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#10120f" media="(prefers-color-scheme: dark)" />
</svelte:head>

<AppShell {children} />
