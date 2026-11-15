// tailwind.config.ts — v4 uses CSS-first; this file can be minimal or omitted
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
