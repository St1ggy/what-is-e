import { additives } from '@/entities/additive'

import type { RequestHandler } from './$types'

import { env } from '$env/dynamic/public'

export const prerender = true

export const GET: RequestHandler = () => {
  const origin = (env.PUBLIC_SITE_URL || 'https://what-e.vercel.app').replace(/\/$/, '')
  const paths = ['/', '/methodology', ...additives.map((additive) => `/additives/${additive.slug}`)]
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join('\n')}
</urlset>`

  return new Response(body, { headers: { 'content-type': 'application/xml' } })
}
