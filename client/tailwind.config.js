/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('tailwindcss').Config} */
const { iconsPlugin, getIconCollections } = require('@egoist/tailwindcss-icons')

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
    iconsPlugin({
      // Select the icon collections you want to use
      collections: getIconCollections(['mdi']),
    }),
  ],
}
