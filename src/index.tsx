import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from '@/router'
import type { NavigateOptions } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.min.css'
import './index.css'

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

if (window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
