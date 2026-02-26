/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts,scss}',
  ],

  safelist: [
    // Opacity variants used dynamically via [class.xxx] bindings
    { pattern: /^bg-(white|black|teal|red|green|yellow|blue|zinc)\/(4|5|6|8|10|12|15|20|25|30|40|50)$/ },
    { pattern: /^border-(white|teal|red|green)\/(6|8|10|12|15|20)$/ },
    { pattern: /^text-(white|teal|red|green|blue|yellow)\/(25|30|40|50|55|60|70|80)$/ },
    { pattern: /^(bg|text)-(teal|red|green|yellow|blue)-(400|500|600)$/ },
    // Dynamic color classes applied via [class.xxx]
    'bg-red-500', 'bg-yellow-400', 'text-teal-400', 'text-red-400', 'text-green-400',
    'text-white', 'bg-white/4', 'bg-white/6', 'bg-white/8',
    'border-white/6', 'border-white/8', 'border-white/10',
    'hover:bg-white/6', 'hover:bg-white/2',
  ],

  theme: {
    extend: {
      fontFamily: {
        sans:    ['Sora', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
        display: ['Playfair Display', 'serif'],
      },
      colors: {
        brand: {
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
      },
      animation: {
        'slide-left': 'slideLeft 0.3s ease',
        'slide-up':   'slideUp 0.25s ease',
      },
    },
  },

  plugins: [],
};
