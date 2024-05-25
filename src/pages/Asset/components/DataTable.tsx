import { Button, Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import PnL from './PnL'
import QueryString from 'qs'
import { Asset } from '@/api'

interface DataTableProps {
  loading: boolean
  assetsList: Asset[]
}

const DataTable = (props: DataTableProps) => {
  const { assetsList, loading } = props

  return (
    <Table aria-label={'Assets'} className={'w-full text-center text-xs'}>
      <TableHeader className={clsx('h-12 text-[#9E9E9E] [&_th]:font-normal', { loading: loading })}>
        <Column isRowHeader>{'TOKEN'}</Column>
        <Column>{'AMOUNT'}</Column>
        <Column>{'AVAILABLE'}</Column>
        <Column>{'VALUE'}</Column>
        <Column>{'CHANGE (TODAY)'}</Column>
        <Column> </Column>
      </TableHeader>
      <TableBody items={assetsList} className={'[&>tr]:h-14 [&>tr]:border-b [&>tr]:border-[#333]'}>
        {(item) => (
          <Row id={item.symbol} className={'[&>td]:px-3 [&>td]:max-w-[100px]'}>
            <Cell>
              <div className={'flex items-center gap-4'}>
                {/* <TokenLogo /> */}
                <img className={'h-6 w-6 rounded-ful'} src={item.logoUri} alt="img" />
                <div className={'flex flex-col items-start'}>
                  <span className={'text-sm'}>{item.name}</span>
                  <span className={'text-[#9E9E9E]'}>{item.symbol}</span>
                </div>
              </div>
            </Cell>
            <Cell>{item.totalAmount}</Cell>
            <Cell>{item.availableAmount}</Cell>
            <Cell>
              {'$ '}
              {item.value}
            </Cell>
            <Cell>
              <PnL value={item.changeToday} />
            </Cell>
            <Cell>
              <div className={'flex items-center justify-center gap-10'}>
                {item.swapFlag === 1 ? <Button className={'text-lemonYellow underline'}>{'Swap'}</Button> : null}
                {item.depositFlag === 1 ? (
                  <Link
                    className={'text-lemonYellow underline'}
                    to={{
                      pathname: '/asset/deposit',
                      search: QueryString.stringify(item, {
                        addQueryPrefix: true,
                      }),
                    }}
                  >
                    {'Deposit'}
                  </Link>
                ) : null}
                {item.withdrawFlag === 1 ? (
                  <Link
                    className={'text-lemonYellow underline'}
                    to={{
                      pathname: '/asset/withdraw',
                      search: QueryString.stringify(item, {
                        addQueryPrefix: true,
                      }),
                    }}
                  >
                    {'Withdraw'}
                  </Link>
                ) : null}
              </div>
            </Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  )
}

export default DataTable
