/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f7f4',
          100: '#dbeee5',
          200: '#b8decb',
          300: '#8ac5ab',
          400: '#5ba687',
          500: '#388869',
          600: '#286d53',
          700: '#1f5743',
          800: '#194536',
          900: '#14392d',
          950: '#0a2019',
        },
        sage: {
          50: '#f4f6f4',
          100: '#e5eae5',
          200: '#ced8cd',
          300: '#adbfac',
          400: '#87a186',
          500: '#698568',
          600: '#526b51',
          700: '#425541',
          800: '#374536',
          900: '#2f3b2f',
        },
        charcoal: {
          50: '#f6f7f7',
          100: '#eaecee',
          200: '#d1d6d9',
          300: '#aab4bb',
          400: '#7d8c97',
          500: '#5f6f7b',
          600: '#4b5964',
          700: '#3f4b53',
          800: '#2b343a',
          900: '#1a2024',
          950: '#101417',
        },
        canvas: {
          50: '#fbfbfa',
          100: '#f6f6f3',
          200: '#eeeee9',
          300: '#e2e2dc',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(16, 32, 25, 0.04)',
        'card': '0 4px 20px -2px rgba(16, 32, 25, 0.05), 0 2px 6px -1px rgba(16, 32, 25, 0.02)',
        'elevated': '0 12px 32px -4px rgba(16, 32, 25, 0.08), 0 4px 12px -2px rgba(16, 32, 25, 0.03)',
        'glow': '0 0 35px -5px rgba(40, 109, 83, 0.15)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
