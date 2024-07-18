import { ClickToComponent } from 'click-to-react-component'
import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { useHref, useNavigate } from 'react-router-dom'
import { I18nProvider, RouterProvider as ReactAriaRouterProvider } from 'react-aria-components'
import { Bounce, ToastContainer } from 'react-toastify'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppBar from '@/components/AppBar'
import Footer from '@/components/Footer'
import { TransactionFailedModal, TransactionInProgressModal } from '@/components/TransactionModal'
import AgreeModal from '@/components/AgreeModal'
import BTCWalletProvider from '@/providers/BTCWalletProvider'
import wagmiConfig from '@/constants/wagmiConfig'
import store from './state'
import ApplicationUpdater from './state/application/updater'
import ListsUpdater from './state/lists/updater'
import MulticallUpdater from './state/multicall/updater'

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
          <ReactAriaRouterProvider navigate={navigate} useHref={useHref}>
            <BTCWalletProvider>
              <Provider store={store}>{children}</Provider>
            </BTCWalletProvider>
          </ReactAriaRouterProvider>
        </I18nProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default function Root() {
  return (
    <StrictMode>
      <ClickToComponent />
      <Providers>
        <Updaters />
        <AppBar />
        <TransactionFailedModal />
        <TransactionInProgressModal />
        <AgreeModal />
        <main className={'flex min-h-[calc(100vh-80px)] justify-center px-[--main-x-padding] overflow-auto py-20'}>
          <div className={'flex w-full max-w-[--main-max-width] flex-col'}>
            <Outlet />
          </div>
        </main>
        <Footer />
        <ToastContainer draggable transition={Bounce} autoClose={3000} />
      </Providers>
    </StrictMode>
  )
}
