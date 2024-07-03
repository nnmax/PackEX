import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import PoolAdd from './Pool/add'
import PoolRemove from './Pool/remove'
import Asset from './Asset'
import Withdraw from './Asset/withdraw'
import Deposit from './Asset/deposit'
import Swap from './Swap'
import AppBar from '@/components/AppBar'
import PoolAll from './Pool/all'
import PoolMy from './Pool/my'
import Pax from './Pax'
import Footer from '@/components/Footer'
import Admin from './Admin'
import { TransactionFailedModal, TransactionInProgressModal } from '@/components/TransactionModal'
import AgreeModal from '@/components/AgreeModal'

export default function App() {
  return (
    <Suspense fallback={null}>
      <AppBar />
      <TransactionFailedModal />
      <TransactionInProgressModal />
      <AgreeModal />
      <main className={'flex min-h-[calc(100vh-80px)] justify-center px-[--main-x-padding] overflow-auto py-20'}>
        <div className={'flex w-full max-w-[--main-max-width] flex-col'}>
          <Routes>
            <Route path="/" element={<Navigate to={'/swap'} />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="/pool" element={<Navigate to={'/pool/all'} />} />
            <Route path="/pool/all" element={<PoolAll />} />
            <Route path="/pool/my" element={<PoolMy />} />
            <Route path="/pool/add/:currencyIdA/:currencyIdB" element={<PoolAdd />} />
            <Route path="/pool/remove/:currencyIdA/:currencyIdB" element={<PoolRemove />} />
            <Route path="/asset" element={<Asset />} />
            <Route path="/asset/withdraw" element={<Withdraw />} />
            <Route path="/asset/deposit" element={<Deposit />} />
            <Route path="/pax" element={<Pax />} />
            <Route path="/__admin" element={<Admin />} />
            <Route element={<Navigate to={'/swap'} />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </Suspense>
  )
}
