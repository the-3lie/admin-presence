import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1B2430',
        paper: '#F7F5F0',
        amber: '#E8A33D',
        green: '#3F7D58',
        clay: '#B5533C'
      }
    }
  },
  plugins: []
};

export default config;
