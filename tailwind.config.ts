import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8EF',
        cocoa: '#3C2A21',
        paw: '#FF8A65',
        mint: '#8CD7B6',
        sky: '#8EC5FF',
        lavender: '#C7B7FF',
        berry: '#9B5DE5'
      },
      boxShadow: {
        soft: '0 20px 70px rgba(80, 57, 32, 0.12)'
      }
    }
  },
  plugins: []
};
export default config;
