import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import pkg from './package.json' assert { type: 'json' }

export default defineConfig({
  plugins: [react({ plugins: [['@swc/plugin-styled-components', {}]] })],
  define: {
    APP_VERSION: `"${pkg.version}"`,
    APP_TITLE: `"${pkg.displayName}"`
  },
  build: {
    outDir: '../server/frontend/dist',
  },
})
