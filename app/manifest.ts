import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Momentum',
    short_name: 'Momentum',
    description: 'Track your gym progress',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0e1110',
    theme_color: '#0e1110',
    icons: [
      { src: '/icon192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon.svg',        sizes: 'any',     type: 'image/svg+xml', purpose: 'any' },
    ],
    categories: ['fitness', 'health', 'sports'],
  };
}
