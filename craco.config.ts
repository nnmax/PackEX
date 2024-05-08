import { CracoConfig } from '@craco/types'

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
  },
}

export default cracoConfig
