/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF6EF',
          200: '#F3EBDD',
          300: '#E8DCC8',
        },
        rose: {
          50: '#FFF5F6',
          100: '#FFE8EC',
          200: '#F9C5D1',
          300: '#E8A4B4',
          400: '#D4849A',
          500: '#B86B82',
          600: '#9A5569',
          700: '#7A4254',
        },
        gold: {
          400: '#D4AF37',
          500: '#C9A962',
          600: '#A88B4A',
        },
        charcoal: {
          700: '#3D3A42',
          800: '#2D2A32',
          900: '#1A1820',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(45, 42, 50, 0.08)',
        card: '0 8px 32px -8px rgba(45, 42, 50, 0.12)',
        glow: '0 0 40px -10px rgba(184, 107, 130, 0.35)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #FAF6EF 0%, #FFF5F6 50%, #F3EBDD 100%)',
        'mesh': 'radial-gradient(at 40% 20%, rgba(232, 164, 180, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(201, 169, 98, 0.12) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(249, 197, 209, 0.1) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
};
