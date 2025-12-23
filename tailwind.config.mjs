/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Forge Glow Dark Theme
        'forge-dark': '#0B0F19',
        'forge-card': '#111827',
        'forge-blue': '#3B82F6',
        'forge-gold': '#F59E0B',
        'forge-red': '#EF4444',
        'forge-purple': '#8B5CF6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'pf': '0.75rem',
      },
    },
  },
  plugins: [],
};
