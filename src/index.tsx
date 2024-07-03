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
import { BrowserRouter, NavigateOptions, useHref, useNavigate } from 'react-router-dom'
import { I18nProvider, RouterProvider } from 'react-aria-components'
import { Bounce, ToastContainer } from 'react-toastify'
import { BTCWalletProvider } from '@/hooks/useBTCWallet'
import { WagmiProvider } from 'wagmi'
import wagmiConfig from '@/constants/wagmiConfig'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

declare module '@uniswap/token-lists' {
  export interface TokenInfo {
    commonFlag: 0 | 1
  }
}

declare module 'react-aria-components' {
  interface RouterConfig {
    routerOptions: NavigateOptions
  }
}

if ('ethereum' in window) {
  ;(window.ethereum as any).autoRefreshOnNetworkChange = false
}

function Updaters() {
  return (
    <>
      <ListsUpdater />
      <ApplicationUpdater />
      <MulticallUpdater />
    </>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

function Providers({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider locale={'en-US'}>
          {/* eslint-disable-next-line react-compiler/react-compiler */}
          <RouterProvider navigate={navigate} useHref={useHref}>
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
