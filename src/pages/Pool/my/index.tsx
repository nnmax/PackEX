'use client'
import { useHistory } from 'react-router-dom'
import { Fragment } from 'react'
import { Button, Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components'
import CryptocurrencyColorBtc from '@/components/Icons/CryptocurrencyColorBtc'
import TokenBlast from '@/components/Icons/TokenBlast'
import GearIcon from '@/components/Icons/GearIcon'

const data = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  tokenOne: `EZETH`,
  tokenTwo: 'WETH',
  tvl: `5${i} M`,
  amount1: `22.${i}`,
  amount2: `${3.1 + i}%`,
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

function GearIconLogo() {
  return (
    <div className={'relative h-5 w-5 rounded-full cursor-pointer mr-3'}>
      <GearIcon className={'h-full w-full rounded-full'} />
    </div>
  )
}

const PoolMy = () => {
  const history = useHistory()
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
                <div className={'flex items-center justify-center'}>
                  {item.id === 1 && <GearIconLogo />}
                  <div className={'flex'}>
                    <span className={'text-xs mr-2'}>{item.tokenOne}</span>/
                    <span className={'text-xs ml-2'}>{item.tokenTwo}</span>
                  </div>
                </div>
              </Cell>
              <Cell>
                <div className={'flex items-center justify-center gap-4'}>
                  <div className={'flex items-center'}>
                    <TokenLogo /> <span className={'text-xs mr-2'}>{item.amount1}</span> /
                    <TokenLogoTwo /> <span className={'text-xs'}>{item.amount2}</span>
                  </div>
                </div>
              </Cell>
              <Cell>{item.share}</Cell>
              <Cell>{item.earn}</Cell>
              <Cell>{item.apy}</Cell>
              <Cell>
                <div className={'flex items-center justify-center gap-6'}>
                  <Button
                    onPress={() => {
                      history.push('/pool/my/add')
                    }}
                    className={'text-lemonYellow w-[60px] h-6 border rounded-sm border-lemonYellow'}
                  >
                    {'+ADD'}
                  </Button>
                  <Button
                    onPress={() => {
                      history.push('/pool/my/remove')
                    }}
                    className={'text-lemonYellow w-[88px] h-6 border rounded-sm border-lemonYellow'}
                  >
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
