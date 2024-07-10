import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import optimizeLocales from '@react-aria/optimize-locales-plugin'
import tsconfigPaths from 'vite-tsconfig-paths'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-react-compiler',
            {
              runtimeModule: 'react-compiler-runtime',
            },
          ],
        ],
      },
    }),
    tsconfigPaths(),
    {
      ...optimizeLocales.vite({
        locales: ['en-US'],
      }),
      enforce: 'pre',
    },
    svgr(),
  ],
  build: {
    sourcemap: false,
  },
  server: {
    proxy: {
      '/packex': {
        target: 'https://api-dev.packex.io',
        changeOrigin: true,
      },
    },
  },
})
