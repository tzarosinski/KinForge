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
      customCss: [
        './src/styles/global.css',
        './src/styles/starlight-mobile.css'
      ],
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: false,
      },
      social: [],
      sidebar: [
        {
          label: 'The Compendium',
          items: [
            { label: 'Welcome', slug: 'compendium/welcome' },
          ],
        },
        {
          label: 'Resources',
          autogenerate: { directory: 'compendium/resources' },
        },
        // -----------------------------
        {
          label: 'Adventures',
          autogenerate: { directory: 'compendium/adventures' },
        },
       
      ],
      components: {
        // Custom SiteTitle with larger icon and animated text
        SiteTitle: './src/components/starlight/SiteTitle.astro',
        // Custom Head for auth protection on compendium pages
        Head: './src/components/starlight/Head.astro',
        // Custom Header
        Header: './src/components/starlight/Header.astro',
        // Custom PageFrame with Health Tracker (renders once per page)
        PageFrame: './src/components/starlight/PageFrame.astro',
        // Custom Content Panel
        ContentPanel: './src/components/starlight/ContentPanel.astro',
        // Disabled desktop "On This Page" sidebar to prevent overlap with health tracker
        TableOfContents: './src/components/starlight/TableOfContents.astro',
        // Custom Mobile Table of Contents (currently hidden)
        MobileTableOfContents: './src/components/starlight/MobileTableOfContents.astro',
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
