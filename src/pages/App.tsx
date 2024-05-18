import { Suspense, useEffect } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import AddLiquidity from './AddLiquidity'
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity,
} from './AddLiquidity/redirects'
import PoolAdd from './Pool/add'
import PoolRemove from './Pool/remove'
import Asset from './Asset'
import Withdraw from './Asset/withdraw'
import Deposit from './Asset/deposit'
import PoolFinder from './PoolFinder'
import RemoveLiquidity from './RemoveLiquidity'
import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects'
import Swap from './Swap'
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
import AppBar from '@/components/AppBar'
import PoolAll from './Pool/all'
import PoolMy from './Pool/my'
import Pax from './Pax'
import { getUser } from '@/api'
import { useUserInfo } from '@/state/user/hooks'

function useInitialUserInfo() {
  const [, updateUserInfo] = useUserInfo()

  useEffect(() => {
    let isMounted = true

    getUser()
      .then((userInfo) => {
        if (isMounted) {
          updateUserInfo(userInfo)
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [updateUserInfo])
}

export default function App() {
  useInitialUserInfo()

  return (
    <Suspense fallback={null}>
      <AppBar />
      <main className={'flex min-h-[calc(100vh-80px)] justify-center px-14 pb-6'}>
        <div className={'flex w-full max-w-[--main-max-width] flex-col'}>
          <Popups />
          <Web3ReactManager>
            <Switch>
              <Route exact strict path="/swap" component={Swap} />
              <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
              <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
              <Route exact strict path="/find" component={PoolFinder} />
              <Route exact strict path="/pool" component={() => <Redirect to={'/pool/all'} />} />
              <Route exact strict path="/pool/all" component={PoolAll} />
              <Route exact strict path="/pool/my" component={PoolMy} />
              <Route exact strict path="/pool/add/:currencyIdA/:currencyIdB" component={PoolAdd} />
              <Route exact strict path="/pool/remove/:currencyIdA/:currencyIdB" component={PoolRemove} />
              <Route exact strict path="/asset" component={Asset} />
              <Route exact strict path="/asset/withdraw" component={Withdraw} />
              <Route exact strict path="/asset/deposit" component={Deposit} />
              <Route exact strict path="/create" component={RedirectToAddLiquidity} />
              <Route exact path="/add" component={AddLiquidity} />
              <Route exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
              <Route exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
              <Route exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
              <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
              <Route exact strict path="/pax" component={Pax} />
              <Route component={RedirectPathToSwapOnly} />
            </Switch>
          </Web3ReactManager>
        </div>
      </main>
    </Suspense>
  )
}
