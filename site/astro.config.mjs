import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// Base path strategy:
//   - Local dev + Vercel preview deploys serve at root ('/'), so URLs look natural.
//   - Production at ifiawakeninla.com/tour: we'll add a rewrite at the
//     ifiawakeninla.com Vercel project that points /tour/* at this project's root.
//   - Override at build time with: BASE_PATH=/tour npm run build
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site: 'https://www.ifiawakeninla.com',
  base,
  trailingSlash: 'never',
  integrations: [tailwind({ applyBaseStyles: false })],
  vite: {
    server: {
      watch: { ignored: ['**/node_modules/**'] },
    },
  },
});
