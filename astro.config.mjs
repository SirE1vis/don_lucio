import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://donsasaa.com', 
  base: '/',
  
  integrations: [
    tailwind(),
    preact(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    })
  ],

  output: 'static',
  
  build: {
    assets: '_astro'
  }
  
});