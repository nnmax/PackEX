'use client'
import { Fragment } from 'react'
import { Button, Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components'
import CryptocurrencyColorBtc from '@/components/Icons/CryptocurrencyColorBtc'
import TokenBlast from '@/components/Icons/TokenBlast'

const data = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  tokenOne: `EZETH`,
  tokenTwo: 'WETH',
  tvl: `5${i} M`,
  share: `${3.1 + i}%`,
  earn: `22.${i}`,
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

const PoolMy = () => {
  return (
    <Table aria-label={'Assets'} className={'w-full text-center text-xs'}>
      <TableHeader className={'h-12 text-[#9E9E9E] [&_th]:font-normal'}>
        <Column isRowHeader>{'POOL NAME'}</Column>
        <Column>{'AMOUNT'}</Column>
        <Column>{'POOL SHARE'}</Column>
        <Column>{'FEE EARNED'}</Column>
        <Column>{'MY LP TOKEN'}</Column>
        <Column>{''}</Column>
      </TableHeader>
      <TableBody items={data} className={'[&>tr]:h-14 [&>tr]:border-b [&>tr]:border-[#333]'}>
        {(item) => (
          <Fragment key={item.id}>
            <Row id={item.id} className={'[&>td]:px-3'}>
              <Cell>
                <div className={'flex items-center justify-center gap-4'}>
                  <div className={'flex'}>
                    <span className={'text-xs'}>{item.tokenOne}</span>/
                    <span className={'text-xs'}>{item.tokenTwo}</span>
                  </div>
                </div>
              </Cell>
              <Cell>
                <div className={'flex items-center justify-center gap-4'}>
                  <div className={'flex items-center'}>
                    <TokenLogo /> <span className={'text-xs'}>{item.tokenOne}</span> /
                    <TokenLogoTwo /> <span className={'text-xs'}>{item.tokenTwo}</span>
                  </div>
                </div>
              </Cell>
              <Cell>{item.share}</Cell>
              <Cell>{item.earn}</Cell>
              <Cell>{item.apy}</Cell>
              <Cell>
                <div className={'flex items-center justify-center gap-6'}>
                  <Button className={'text-lemonYellow w-[60px] h-6 border rounded-sm border-lemonYellow'}>
                    {'+ADD'}
                  </Button>
                  <Button className={'text-lemonYellow w-[88px] h-6 border rounded-sm border-lemonYellow'}>
                    {'—REMOVE'}
                  </Button>
                </div>
              </Cell>
            </Row>
          </Fragment>
        )}
      </TableBody>
    </Table>
  )
}

export default PoolMy
