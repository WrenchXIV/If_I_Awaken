import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://www.ifiawakeninla.com',
  base: '/tour',
  trailingSlash: 'never',
  integrations: [tailwind({ applyBaseStyles: false })],
  vite: {
    server: {
      watch: { ignored: ['**/node_modules/**'] },
    },
  },
});
