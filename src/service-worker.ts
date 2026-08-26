/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { base, build, files, version } from '$service-worker'

const worker = globalThis.self as unknown as ServiceWorkerGlobalScope
const cacheName = `what-e-${version}`
const coreRoutes = [`${base}/`, `${base}/catalog`, `${base}/methodology`]
const appShell = [...build, ...files, ...coreRoutes]

async function installAppShell() {
  const cache = await caches.open(cacheName)

  await cache.addAll(appShell)
}

async function activateWorker() {
  const keys = await caches.keys()

  await Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key)))
  await worker.clients.claim()
}

async function fetchAndCache(cache: Cache, request: Request): Promise<Response> {
  const response = await fetch(request)

  if (response.ok && !response.headers.get('cache-control')?.includes('no-store')) {
    await cache.put(request, response.clone())
  }

  return response
}

async function handleNavigation(cache: Cache, request: Request): Promise<Response> {
  try {
    return await fetchAndCache(cache, request)
  } catch (error) {
    const cached = (await cache.match(request)) ?? (await cache.match(`${base}/`))

    if (cached) return cached

    throw error
  }
}

async function handleRequest(request: Request): Promise<Response> {
  const cache = await caches.open(cacheName)

  if (request.mode === 'navigate') return handleNavigation(cache, request)

  const cached = appShell.includes(new URL(request.url).pathname) ? await cache.match(request) : undefined

  if (cached) return cached

  try {
    return await fetchAndCache(cache, request)
  } catch (error) {
    const fallback = await cache.match(request)

    if (fallback) return fallback

    throw error
  }
}

worker.addEventListener('install', (event) => {
  event.waitUntil(installAppShell())
  worker.skipWaiting()
})

worker.addEventListener('activate', (event) => {
  event.waitUntil(activateWorker())
})

worker.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const { origin } = new URL(event.request.url)

  if (origin !== worker.location.origin) return

  event.respondWith(handleRequest(event.request))
})
