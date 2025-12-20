// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://playparableforge.com',
  integrations: [
    starlight({
      title: 'ParableForge',
      description: 'Screen-free family adventures. Zero prep. Pure connection.',
      customCss: ['./src/styles/global.css'],
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: true,
      },
      social: [],
      sidebar: [
        {
          label: 'The Grimoire',
          items: [
            { label: 'Welcome', slug: 'grimoire/welcome' },
          ],
        },
        {
          label: 'Adventures',
          autogenerate: { directory: 'grimoire/adventures' },
        },
      ],
      components: {
        // Custom Head for auth protection on grimoire pages
        Head: './src/components/starlight/Head.astro',
      },
      // Disable default Starlight homepage to use custom landing page
      disable404Route: false,
    }),
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
  ],
});
