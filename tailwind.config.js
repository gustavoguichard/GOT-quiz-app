/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx,jsx,js}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['Quicksand'],
        alt: ['"Source Sans Pro"'],
      },
    },
  },
  plugins: [],
}
