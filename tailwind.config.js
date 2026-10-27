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
          50: '#f2f7f4',
          100: '#e1ede7',
          200: '#c5ded3',
          300: '#9ec7b5',
          400: '#6fa891',
          500: '#488c72',
          600: '#34715b',
          700: '#2b5a4a',
          800: '#24483c',
          900: '#1e3c32',
          950: '#0e221c',
        },
        sage: {
          50: '#f6f8f6',
          100: '#ebf1ec',
          200: '#d7e3da',
          300: '#b8cec0',
          400: '#8faa98',
          500: '#698874',
          600: '#4f6d5a',
          700: '#3f5647',
          800: '#34463a',
          900: '#2a382f',
          950: '#151d18',
        },
        charcoal: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#0b0f17',
        },
        canvas: {
          50: '#fafaf7',
          100: '#f4f4f0',
          200: '#eaeae4',
          300: '#deded6',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(17, 24, 39, 0.04)',
        'card': '0 1px 3px 0 rgba(17, 24, 39, 0.06), 0 1px 2px -1px rgba(17, 24, 39, 0.04)',
        'elevated': '0 4px 12px -2px rgba(17, 24, 39, 0.07), 0 2px 6px -1px rgba(17, 24, 39, 0.03)',
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
}
