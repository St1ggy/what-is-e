<script lang="ts">
  import { resolve } from '$app/paths'
  import { ArrowUpRight, Languages, Moon, Sun } from '@lucide/svelte'
  import { onMount } from 'svelte'

  import * as m from '@/paraglide/messages'
  import { getLocale, setLocale } from '@/paraglide/runtime'

  type Theme = 'light' | 'dark'

  let currentTheme = $state<Theme>('light')

  function handleSystemTheme(event: MediaQueryListEvent) {
    if (!localStorage.getItem('e-list-theme')) setTheme(event.matches ? 'dark' : 'light', false)
  }

  onMount(() => {
    currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'

    const media = matchMedia('(prefers-color-scheme: dark)')

    media.addEventListener('change', handleSystemTheme)

    return () => media.removeEventListener('change', handleSystemTheme)
  })

  function setTheme(theme: Theme, shouldPersist: boolean) {
    currentTheme = theme
    document.documentElement.dataset.theme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#10110f' : '#f7f7f4')

    if (shouldPersist) localStorage.setItem('e-list-theme', theme)
  }

  function setInterfaceLocale(locale: 'en' | 'ru') {
    setLocale(locale)

    const appName = locale === 'ru' ? 'Что за E?' : 'What is E?'

    document
      .querySelector('link[rel="manifest"]')
      ?.setAttribute('href', locale === 'ru' ? '/manifest.webmanifest' : '/manifest.en.webmanifest')
    document.querySelector('meta[name="application-name"]')?.setAttribute('content', appName)
    document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', appName)
  }
</script>

<footer class="site-footer">
  <p>{m.footerDisclaimer()}</p>

  <nav class="footer-links" aria-label={m.navigation()}>
    <a href={resolve('/catalog')}>{m.fullCatalog()}</a>
    <a href={resolve('/methodology')}>{m.methodology()}</a>
    <a href="https://eur-lex.europa.eu/eli/reg/2008/1333/oj/eng">EUR-Lex <ArrowUpRight size={12} /></a>
    <a href="https://eec.eaeunion.org/comission/department/deptexreg/tr/bezopPischDobavok.php">
      EEC <ArrowUpRight size={12} />
    </a>
    <a href="https://www.efsa.europa.eu/en/topics/topic/food-additives">EFSA <ArrowUpRight size={12} /></a>
    <a href="https://www.who.int/news-room/fact-sheets/detail/food-additives">WHO <ArrowUpRight size={12} /></a>
  </nav>

  <div class="footer-preferences">
    <button
      type="button"
      aria-label={getLocale() === 'ru' ? m.switchToEnglish() : m.switchToRussian()}
      onclick={() => setInterfaceLocale(getLocale() === 'ru' ? 'en' : 'ru')}
    >
      <Languages size={15} aria-hidden="true" />
      {getLocale() === 'ru' ? 'EN' : 'RU'}
    </button>
    <button
      type="button"
      aria-label={currentTheme === 'light' ? m.switchToDark() : m.switchToLight()}
      onclick={() => setTheme(currentTheme === 'light' ? 'dark' : 'light', true)}
    >
      {#if currentTheme === 'light'}
        <Moon size={15} aria-hidden="true" />
      {:else}
        <Sun size={15} aria-hidden="true" />
      {/if}
    </button>
  </div>
</footer>
