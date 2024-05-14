import {
  BrowserRouter as Router,
  Switch,
  Route,
  // Link,
  // useParams,
  // useRouteMatch
} from 'react-router-dom'
import LinkTab from '@/components/LinkTab'
import PoolAll from './all'
import PoolMy from './my'

export default function NestingExample() {
  return (
    <Router>
      <div>
        <div className={'flex text-sm gap-8 mt-8 mb-7 ml-14 pb-2'}>
          <LinkTab to="/pool/all">ALL POOLS</LinkTab>
          <LinkTab to="/pool/my">My Pools</LinkTab>
        </div>
        <Switch>
          <Route exact strict path="/pool/all">
            <PoolAll />
          </Route>
          <Route exact strict path="/pool/my">
            <PoolMy />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}
