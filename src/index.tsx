import { ClickToComponent } from 'click-to-react-component'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './pages/App'
import store from './state'
import ApplicationUpdater from './state/application/updater'
import ListsUpdater from './state/lists/updater'
import MulticallUpdater from './state/multicall/updater'
import './index.css'
import { BrowserRouter, useHistory } from 'react-router-dom'
import { I18nProvider, RouterProvider } from 'react-aria-components'
import { Bounce, ToastContainer } from 'react-toastify'
import { BTCWalletProvider } from '@/hooks/useBTCWallet'
import PriceUpdater from '@/state/price/updater'
import { WagmiProvider } from 'wagmi'
import wagmiConfig from '@/constants/wagmiConfig'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

declare module '@uniswap/token-lists' {
  export interface TokenInfo {
    commonFlag: 0 | 1
  }
}

// const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

if ('ethereum' in window) {
  ;(window.ethereum as any).autoRefreshOnNetworkChange = false
}

function Updaters() {
  return (
    <>
      <ListsUpdater />
      <ApplicationUpdater />
      <MulticallUpdater />
      <PriceUpdater />
    </>
  )
}

const queryClient = new QueryClient()

function Providers({ children }: { children: React.ReactNode }) {
  const history = useHistory()
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider locale={'en-US'}>
          <RouterProvider navigate={history.push}>
            <BTCWalletProvider>
              <Provider store={store}>{children}</Provider>
            </BTCWalletProvider>
          </RouterProvider>
        </I18nProvider>
      </QueryClientProvider>
    </WagmiProvider>
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
