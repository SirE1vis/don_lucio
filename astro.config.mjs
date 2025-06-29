import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';

export default defineConfig({
  site: 'https://SirE1vis.github.io',
  base: '/',
  
  integrations: [
    tailwind(),
    preact()
  ],

  output: 'static',
  
  build: {
    assets: '_astro'
  }
  
});