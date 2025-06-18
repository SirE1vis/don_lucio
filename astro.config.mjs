import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';

export default defineConfig({
  site: 'http://localhost:4321',
  
  integrations: [
    tailwind(),
    preact()
  ],
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
    formats: ['webp', 'png'],
  }
});