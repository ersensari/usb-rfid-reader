import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react({ plugins: [['@swc/plugin-styled-components', {}]] })],
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
    APP_TITLE: JSON.stringify('Manifest Location Tracker'),
  },
  build: {
    outDir: './server/client/dist',
  },
})
