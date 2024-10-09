import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import optimizeLocales from '@react-aria/optimize-locales-plugin'
import tsconfigPaths from 'vite-tsconfig-paths'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig((env) => ({
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
        target: env.mode === 'prod' ? 'https://api.packex.io' : 'https://api-dev.packex.io',
        changeOrigin: true,
      },
      '/kyberswap': {
        target: 'https://aggregator-api.kyberswap.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kyberswap/, ''),
      },
    },
    host: '0.0.0.0',
  },
}))
