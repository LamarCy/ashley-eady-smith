import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Domain is her full name .com (brief R1). Confirm before DNS.
export default defineConfig({
  site: 'https://ashleyeadysmith.com',
  integrations: [sitemap({ filter: (page) => !/\/(thanks|404)\/?$/.test(page) })],
  build: { inlineStylesheets: 'auto' },
});
