import { createBrowserRouter, Navigate } from 'react-router-dom'
import NotFound from '@/pages/404'
import Admin from '@/pages/Admin'
import Asset from '@/pages/Asset'
import Deposit from '@/pages/Asset/deposit'
import Withdraw from '@/pages/Asset/withdraw'
import Earn from '@/pages/Earn'
import PoolAdd from '@/pages/Pool/add'
import PoolAll from '@/pages/Pool/all'
import PoolMy from '@/pages/Pool/my'
import PoolRemove from '@/pages/Pool/remove'
import Swap from '@/pages/Swap'
import Root from '@/root'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <Swap />,
      },
      {
        path: '/pool',
        element: <Navigate to={'/pool/all'} />,
      },
      {
        path: '/pool/all',
        element: <PoolAll />,
      },
      {
        path: '/pool/my',
        element: <PoolMy />,
      },
      {
        path: '/pool/add/:currencyIdA/:currencyIdB',
        element: <PoolAdd />,
      },
      {
        path: '/pool/remove/:currencyIdA/:currencyIdB',
        element: <PoolRemove />,
      },
      {
        path: '/asset',
        element: <Asset />,
      },
      {
        path: '/asset/withdraw',
        element: <Withdraw />,
      },
      {
        path: '/asset/deposit',
        element: <Deposit />,
      },
      {
        path: '/earn',
        element: <Earn />,
      },
      {
        path: '/__admin',
        element: <Admin />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])

export default router
