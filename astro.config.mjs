import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Her full name .com (brief R1). Registered at Namecheap 2026-10-09; DNS points at Netlify.
export default defineConfig({
  site: 'https://ashleyeadysmith.com',
  integrations: [sitemap({ filter: (page) => !/\/(thanks|404)\/?$/.test(page) })],
  build: { inlineStylesheets: 'auto' },
});
