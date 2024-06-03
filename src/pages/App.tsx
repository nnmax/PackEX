import { Suspense, useEffect } from 'react'
import { Redirect, Route, Switch, useHistory } from 'react-router-dom'
import Web3ReactManager from '../components/Web3ReactManager'
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
import { getUser } from '@/api'
import { useUserInfo } from '@/state/user/hooks'
import Footer from '@/components/Footer'

function useInitialUserInfo() {
  const [, updateUserInfo] = useUserInfo()
  const history = useHistory()

  useEffect(() => {
    let isMounted = true

    getUser()
      .then((userInfo) => {
        if (isMounted) {
          updateUserInfo(userInfo)
        }
      })
      .catch(() => {
        if (isMounted) {
          updateUserInfo(null)
        }
      })

    return () => {
      isMounted = false
    }
  }, [history, updateUserInfo])
}

export default function App() {
  useInitialUserInfo()

  return (
    <Suspense fallback={null}>
      <AppBar />
      <main className={'flex min-h-[calc(100vh-80px-80px)] justify-center px-[--main-x-padding] pb-6'}>
        <div className={'flex w-full max-w-[--main-max-width] flex-col'}>
          <Web3ReactManager>
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
              <Route component={RedirectPathToSwapOnly} />
            </Switch>
          </Web3ReactManager>
        </div>
      </main>
      <Footer />
    </Suspense>
  )
}
