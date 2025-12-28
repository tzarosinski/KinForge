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
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' }
        },
        flash: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '0.5' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        shake: 'shake 0.5s ease-in-out',
        flash: 'flash 0.3s ease-in-out',
        'fade-in': 'fade-in 0.3s ease-out'
      }
    },
  },
  plugins: [],
};
