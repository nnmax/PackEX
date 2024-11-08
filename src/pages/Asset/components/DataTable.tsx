import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components'
import { Link } from 'react-router-dom'
import QueryString from 'qs'
import clsx from 'clsx'
import { formatAmountColumn, formatValueColumn } from '@/utils/prices'
import CurrencyLogo from '@/components/CurrencyLogo'
import PnL from './PnL'
import type { Asset } from '@/api'

interface DataTableProps {
  isLoading: boolean
  assetsList: Asset[]
}

const DataTable = (props: DataTableProps) => {
  const { assetsList, isLoading } = props

  return (
    <Table aria-label={'Assets'} className={'w-full text-center text-xs'}>
      <TableHeader className={clsx('h-12 text-[#9E9E9E] [&_th]:font-normal')}>
        <Column isRowHeader>{'TOKEN'}</Column>
        <Column>{'AMOUNT'}</Column>
        <Column>{'AVAILABLE'}</Column>
        <Column>{'VALUE'}</Column>
        <Column>{'CHANGE (TODAY)'}</Column>
        <Column> </Column>
      </TableHeader>
      <TableBody
        renderEmptyState={
          isLoading
            ? () => <span className={clsx({ 'loading text-2xl': isLoading })} />
            : () => <p className={'mt-2 text-sm text-[#9e9e9e]'}>{'NO DATA'}</p>
        }
        items={assetsList}
        className={clsx('[&>tr]:h-[76px] [&>tr]:border-b [&>tr]:border-[#333]')}
      >
        {(item) => (
          <Row id={item.id} className={'[&>td]:px-3 [&>td]:pt-4 [&>td]:max-w-[120px]'}>
            <Cell>
              <div className={'flex items-center gap-4'}>
                <CurrencyLogo size={'24px'} src={item.logoUri} />
                <div className={'flex flex-col items-start'}>
                  <span className={'text-sm'}>{item.name}</span>
                  <span className={'text-[#9E9E9E]'}>{item.symbol}</span>
                </div>
              </div>
            </Cell>
            <Cell>{formatAmountColumn(item.totalAmount)}</Cell>
            <Cell>{formatAmountColumn(item.availableAmount)}</Cell>
            <Cell>{item.symbol === 'PAX' ? '-' : formatValueColumn(item.value)}</Cell>
            <Cell>
              <PnL value={item.changeToday} />
            </Cell>
            <Cell>
              <div className={'flex items-center justify-start gap-x-4 gap-y-2 flex-wrap'}>
                {item.swapFlag === 1 ? (
                  <Link
                    to={`/?inputCurrency=${item.symbol.toUpperCase() === 'ETH' ? 'ETH' : item.tokenContract}`}
                    className={'text-lemonYellow underline'}
                  >
                    {'Swap'}
                  </Link>
                ) : null}
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
