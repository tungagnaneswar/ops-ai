/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1677ff', // Ant Design primary blue
        success: '#52c41a',
        warning: '#faad14',
        error: '#ff4d4f',
        dark: '#141414',
        light: '#f0f2f5',
      },
    },
  },
  corePlugins: {
    // Disable preflight to avoid conflicts with Ant Design's CSS reset
    preflight: false,
  },
  plugins: [],
}
