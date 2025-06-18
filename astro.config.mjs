import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';

export default defineConfig({
  site: 'https://SirE1vis.github.io',
  base: 'don_lucio',
  
  integrations: [
    tailwind(),
    preact()
  ],
  
});