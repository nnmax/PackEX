'use client'
import { Button, Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components'
import { Link } from 'react-router-dom'
import CryptocurrencyColorBtc from '@/components/Icons/CryptocurrencyColorBtc'
import TokenBlast from '@/components/Icons/TokenBlast'
import PnL from './PnL'

const data = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  token: `Bitcoin`,
  chain: 'BTC',
  amount: `File folder ${i}`,
  available: `6/7/2020 ${i}`,
  value: `Value ${i}`,
  pnl: `${23.31 + i + 1}%`,
}))

function TokenLogo() {
  return (
    <div className={'relative h-6 w-6 rounded-full bg-black'}>
      <CryptocurrencyColorBtc className={'h-full w-full rounded-full'} />
      <div className={'absolute right-0 top-0 h-4 w-4 -translate-y-1.5 translate-x-1.5 rounded-full bg-black'}>
        <TokenBlast className={'h-full w-full'} />
      </div>
    </div>
  )
}

export default function DataTable() {
  return (
    <Table aria-label={'Assets'} className={'w-full text-center text-xs'}>
      <TableHeader className={'h-12 text-[#9E9E9E] [&_th]:font-normal'}>
        <Column isRowHeader>{'TOKEN'}</Column>
        <Column>{'AMOUNT'}</Column>
        <Column>{'AVAILABLE'}</Column>
        <Column>{'VALUE'}</Column>
        <Column>{'CHANGE（TODAY）'}</Column>
        <Column> </Column>
      </TableHeader>
      <TableBody items={data} className={'[&>tr]:h-14 [&>tr]:border-b [&>tr]:border-[#333]'}>
        {(item) => (
          <Row id={item.id} className={'[&>td]:px-3'}>
            <Cell>
              <div className={'flex items-center justify-center gap-4'}>
                <TokenLogo />
                <div className={'flex flex-col items-start'}>
                  <span className={'text-sm'}>{item.token}</span>
                  <span className={'text-[#9E9E9E]'}>{item.chain}</span>
                </div>
              </div>
            </Cell>
            <Cell>{item.amount}</Cell>
            <Cell>{item.available}</Cell>
            <Cell>
              {'$ '}
              {item.value}
            </Cell>
            <Cell>
              <PnL value={item.pnl} {...(item.id % 2 === 0 ? { negative: true } : { positive: true })} />
            </Cell>
            <Cell>
              <div className={'flex items-center justify-center gap-10'}>
                <Button className={'text-lemonYellow underline'}>{'Swap'}</Button>
                <Link className={'text-lemonYellow underline'} to={'/asset/deposit'}>
                  {'Deposit'}
                </Link>
                <Link className={'text-lemonYellow underline'} to={'/asset/withdraw'}>
                  {'Withdraw'}
                </Link>
              </div>
            </Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  )
}
