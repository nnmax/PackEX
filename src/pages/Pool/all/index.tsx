'use client'
import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components'
import { Link } from 'react-router-dom'
import CryptocurrencyColorBtc from '@/components/Icons/CryptocurrencyColorBtc'
import TokenBlast from '@/components/Icons/TokenBlast'
// import PnL from '../../Asset/components/PnL'

const data = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  tokenOne: `EZETH`,
  tokenTwo: 'WETH',
  tvl: `5${i} M`,
  oneday: `123 ${i}23`,
  severDay: `321 ${i}23`,
  value: `Value ${i}`,
  apy: `${3.1 + i}%`,
}))

function TokenLogo() {
  return (
    <div className={'relative h-6 w-6 rounded-full bg-black'}>
      <CryptocurrencyColorBtc className={'h-full w-full rounded-full'} />
    </div>
  )
}

function TokenLogoTwo() {
  return (
    <div className={'relative h-6 w-6 rounded-full bg-black'}>
      <TokenBlast className={'h-full w-full rounded-full'} />
    </div>
  )
}

const PoolAll = () => {
  return (
    <Table aria-label={'Assets'} className={'w-full text-center text-xs'}>
      <TableHeader className={'h-12 text-[#9E9E9E] [&_th]:font-normal'}>
        <Column isRowHeader>{'POOL NAME'}</Column>
        <Column className={' table-cell'}>
          <span>{'TVL '}↓</span>
        </Column>
        <Column>{'VOLUME (24H)'}</Column>
        <Column>{'VOLUME (7D)'}</Column>
        <Column>{'APY'}</Column>
        <Column>{'ACTION'}</Column>
      </TableHeader>
      <TableBody items={data} className={'[&>tr]:h-14 [&>tr]:border-b [&>tr]:border-[#333]'}>
        {(item) => (
          <Row id={item.id} className={'[&>td]:px-3'}>
            <Cell>
              <div className={'flex items-center justify-center gap-4'}>
                <TokenLogo />
                <TokenLogoTwo />
                <div className={'flex'}>
                  <span className={'text-xs'}>{item.tokenOne}</span>/<span className={'text-xs'}>{item.tokenTwo}</span>
                </div>
              </div>
            </Cell>
            <Cell>{item.tvl}</Cell>
            <Cell>{item.oneday}</Cell>
            <Cell>{item.severDay}</Cell>
            <Cell>{item.apy}</Cell>
            <Cell>
              <div className={'flex items-center justify-center gap-10'}>
                <Link className={'text-lemonYellow underline'} to={'/pool/add'}>
                  {'Add liquidity'}
                </Link>
              </div>
            </Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  )
}

export default PoolAll
