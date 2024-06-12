import { Suspense } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import PoolAdd from './Pool/add'
import PoolRemove from './Pool/remove'
import Asset from './Asset'
import Withdraw from './Asset/withdraw'
import Deposit from './Asset/deposit'
import Swap from './Swap'
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
import AppBar from '@/components/AppBar'
import PoolAll from './Pool/all'
import PoolMy from './Pool/my'
import Pax from './Pax'
import Footer from '@/components/Footer'
import Admin from './Admin'

export default function App() {
  return (
    <Suspense fallback={null}>
      <AppBar />
      <main className={'flex min-h-[calc(100vh-80px-80px)] justify-center px-[--main-x-padding] pb-6'}>
        <div className={'flex w-full max-w-[--main-max-width] flex-col'}>
          <Switch>
            <Route exact strict path="/swap" component={Swap} />
            <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
            <Route exact strict path="/pool" component={() => <Redirect to={'/pool/all'} />} />
            <Route exact strict path="/pool/all" component={PoolAll} />
            <Route exact strict path="/pool/my" component={PoolMy} />
            <Route exact strict path="/pool/add/:currencyIdA/:currencyIdB" component={PoolAdd} />
            <Route exact strict path="/pool/remove/:currencyIdA/:currencyIdB" component={PoolRemove} />
            <Route exact strict path="/asset" component={Asset} />
            <Route exact strict path="/asset/withdraw" component={Withdraw} />
            <Route exact strict path="/asset/deposit" component={Deposit} />
            <Route exact strict path="/pax" component={Pax} />
            <Route exact strict path="/__admin" component={Admin} />
            <Route component={RedirectPathToSwapOnly} />
          </Switch>
        </div>
      </main>
      <Footer />
    </Suspense>
  )
}
