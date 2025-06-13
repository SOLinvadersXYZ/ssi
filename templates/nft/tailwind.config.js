/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'nft-primary': '#ec4899',
        'nft-secondary': '#8b5cf6',
        'nft-accent': '#f59e0b',
        'nft-rare': '#3b82f6',
        'nft-epic': '#8b5cf6',
        'nft-legendary': '#f59e0b',
      },
    },
  },
  plugins: [],
}
