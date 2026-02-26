import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8F0',
        primary: '#F59E0B',
        secondary: '#EC4899',
      },
      borderRadius: {
        card: '24px',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};
export default config;
