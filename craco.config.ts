import { CracoConfig } from '@craco/types'
import optimizeLocales from '@react-aria/optimize-locales-plugin'

const cracoConfig: CracoConfig = {
  babel: {
    plugins: ['babel-plugin-styled-components'],
  },
  webpack: {
    alias: {
      '@': require('path').resolve(__dirname, 'src/'),
    },
    configure(config) {
      config.ignoreWarnings ??= []
      config.ignoreWarnings.push(/Failed to parse source map/)
      return config
    },
    plugins: {
      add: [
        optimizeLocales.webpack({
          locales: ['en-US'],
        }),
      ],
    },
  },
}

export default cracoConfig
