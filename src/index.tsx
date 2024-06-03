import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import { ClickToComponent } from 'click-to-react-component'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { NetworkContextName } from './constants'
import App from './pages/App'
import store from './state'
import ApplicationUpdater from './state/application/updater'
import ListsUpdater from './state/lists/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionUpdater from './state/transactions/updater'
import getLibrary from './utils/getLibrary'
import './index.css'
import { BrowserRouter, useHistory } from 'react-router-dom'
import { I18nProvider, RouterProvider } from 'react-aria-components'
import { Bounce, ToastContainer } from 'react-toastify'
import { BTCWalletProvider } from '@/hooks/useBTCWallet'

declare module '@uniswap/token-lists' {
  export interface TokenInfo {
    commonFlag: 0 | 1
  }
}

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

if ('ethereum' in window) {
  ;(window.ethereum as any).autoRefreshOnNetworkChange = false
}

function Updaters() {
  return (
    <>
      <ListsUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
    </>
  )
}

function Providers({ children }: { children: React.ReactNode }) {
  const history = useHistory()
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <I18nProvider locale={'en-US'}>
          <RouterProvider navigate={history.push}>
            <BTCWalletProvider>
              <Provider store={store}>{children}</Provider>
            </BTCWalletProvider>
          </RouterProvider>
        </I18nProvider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClickToComponent />
    <BrowserRouter>
      <Providers>
        <Updaters />
        <App />
        <ToastContainer draggable transition={Bounce} autoClose={3000} />
      </Providers>
    </BrowserRouter>
  </StrictMode>,
)
