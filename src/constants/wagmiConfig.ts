import { IS_PROD } from '@/constants'
import { createConfig, createConnector, http } from 'wagmi'
import { blast, blastSepolia } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'
import coinbaseWalletIcon from '@/assets/images/coinbaseWalletIcon.svg'
import walletConnectIcon from '@/assets/images/walletConnectIcon.svg'
import metamaskIcon from '@/assets/images/metamask-icon.svg'
import browserWalletIcon from '@/assets/images/browser-wallet-light.svg'

const coinbaseWalletWithIcon = () => {
  return createConnector<any>((config) => {
    const coinbaseWalletReturn = coinbaseWallet({
      appLogoUrl: IS_PROD ? 'https://packex.io/favicon.svg' : 'https://web-dev.packex.io/favicon.svg',
      appName: 'PackEX',
    })(config)

    return {
      ...coinbaseWalletReturn,
      icon: coinbaseWalletIcon,
    }
  })
}

const walletConnectWithIcon = () => {
  return createConnector<any>((config) => {
    const walletConnectReturn = walletConnect({
      projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID!,
      metadata: {
        name: 'PackEX',
        description: 'PackEX',
        url: IS_PROD ? 'https://packex.io' : 'https://web-dev.packex.io',
        icons: [IS_PROD ? 'https://packex.io/favicon.svg' : 'https://web-dev.packex.io/favicon.svg'],
      },
    })(config)

    return {
      ...walletConnectReturn,
      icon: walletConnectIcon,
    }
  })
}

function injectedWithFallback() {
  return createConnector((config) => {
    const injectedConnector = injected()(config)

    return {
      ...injectedConnector,
      connect(...params) {
        if (!window.ethereum) {
          window.open('https://metamask.io/', 'inst_metamask')
        }
        return injectedConnector.connect(...params)
      },
      get icon() {
        return !window.ethereum || window.ethereum?.isMetaMask ? metamaskIcon : browserWalletIcon
      },
      get name() {
        return !window.ethereum ? 'Install MetaMask' : window.ethereum?.isMetaMask ? 'MetaMask' : 'Browser Wallet'
      },
    }
  })
}

const wagmiConfig = createConfig({
  chains: [IS_PROD ? blast : blastSepolia],
  connectors: [injectedWithFallback(), coinbaseWalletWithIcon(), walletConnectWithIcon()],
  transports: {
    [blast.id]: http(),
    [blastSepolia.id]: http(),
  },
})

export default wagmiConfig
