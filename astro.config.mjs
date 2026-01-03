// @ts-check
import { defineConfig } from 'astro/config';

import sanity from '@sanity/astro';
import react from '@astrojs/react';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  redirects: {
      '/designs/': '/designs/25-26/periapsis',
      '/posts/': '/posts/first-post'
  },

  integrations: [sanity(
    { projectId: '366sb9yi',
      dataset: 'production',
      useCdn: false,
      apiVersion: '2025-01-28',
      studioBasePath: '/admin',
    }
  ), react()],

  output: 'static',
  adapter: vercel()
});