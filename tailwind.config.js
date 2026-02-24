export const darkMode = 'class';
export const content = [
  './pages/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
  './app/**/*.{js,ts,jsx,tsx,mdx}',
];
export const theme = {
  extend: {
    colors: {
      // Brand gold
      gold: {
        DEFAULT: '#D4AF37',
        light: '#E5C158',
        dark: '#c9a634',
      },

      // Refined light mode colors
      'light-base': '#F8FAFC', // slate-50
      'light-card': '#FFFFFF', // white
      'light-nested': '#F1F5F9', // slate-100


      // Dark mode colors
      'dark-base': '#0A0A0F',
      'dark-card': '#1F1F27',
      'dark-nested': '#13131A',
    },

    boxShadow: {
      // Soft shadows for light mode (color-matched)
      'light-sm': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
      'light-md': '0 4px 6px -1px rgb(0 0 0 / 0.05)',
      'light-lg': '0 10px 15px -3px rgb(0 0 0 / 0.05)',

      // Color-matched accent shadows
      'emerald-sm': '0 1px 3px 0 rgb(16 185 129 / 0.15)',
      'blue-sm': '0 1px 3px 0 rgb(59 130 246 / 0.15)',
      'orange-sm': '0 1px 3px 0 rgb(249 115 22 / 0.15)',
      'red-sm': '0 1px 3px 0 rgb(239 68 68 / 0.15)',
      'purple-sm': '0 1px 3px 0 rgb(168 85 247 / 0.15)',
    },

    backgroundImage: {
      // Subtle gradients for depth
      'gradient-light': 'linear-gradient(to bottom right, rgb(248 250 252), rgb(241 245 249 / 0.5))',
      'gradient-card': 'linear-gradient(to right, rgb(248 250 252), rgb(248 250 252 / 0.5))',
      'gradient-emerald': 'linear-gradient(to bottom right, rgb(236 253 245), rgb(209 250 229 / 0.6))',
      'gradient-blue': 'linear-gradient(to bottom right, rgb(239 246 255), rgb(219 234 254 / 0.6))',
      'gradient-orange': 'linear-gradient(to bottom right, rgb(255 247 237), rgb(254 215 170 / 0.6))',
    }
  }
};
export const plugins = [];
