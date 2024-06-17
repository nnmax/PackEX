import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Fragment } from 'react'
import { Cell, Column, Row, Table, TableBody, TableHeader, ModalOverlay, Modal, Checkbox } from 'react-aria-components'
import clsx from 'clsx'
import { PoolMyItem } from '@/api'
import PoolLayout from '@/pages/Pool/Layout'
import { useMyPools } from '@/api/get-my-pools'
import CurrencyLogo from '@/components/CurrencyLogo'

const PoolMy = () => {
  const [isOpen, setOpen] = useState<boolean>(false)
  const [selectedFlagOne, setSelectedFlagOne] = useState<boolean>(true)
  const [selectedFlagTwo, setSelectedFlagTwo] = useState<boolean>(false)
  const { data, isLoading } = useMyPools()

  return (
    <PoolLayout activeTab={'my'}>
      <Table aria-label={'Assets'} className={'w-full text-center text-xs'}>
        <TableHeader className={clsx('h-12 text-[#9E9E9E] [&_th]:font-normal', { 'loading text-2xl': isLoading })}>
          <Column isRowHeader>{'POOL NAME'}</Column>
          <Column>{'AMOUNT'}</Column>
          <Column>{'POOL SHARE'}</Column>
          <Column>{'PAX EARNED (TODAY)'}</Column>
          <Column>{'MY LP TOKEN'}</Column>
          <Column>{''}</Column>
        </TableHeader>
        <TableBody items={data?.myPools} className={clsx('[&>tr]:h-[76px] [&>tr]:border-b [&>tr]:border-[#333]')}>
          {(item) => (
            <Fragment key={item.id}>
              <Row id={item.id} className={'[&>td]:px-3 [&>td]:pt-4 [&>td]:max-w-[100px]'}>
                <Cell>
                  <div className={'flex justify-center'}>
                    <div className={'relative flex items-center'}>
                      {/* {item.id === 1 && <GearIconLogo />} */}
                      <span className={'text-xs mr-2'}>{item.token0Name}</span> /
                      <span className={'text-xs ml-2'}>{item.token1Name}</span>
                    </div>
                  </div>
                </Cell>
                <Cell>
                  <div className={'flex items-center justify-center gap-4'}>
                    <div className={'flex items-center justify-start'}>
                      <CurrencyLogo size="24px" src={item.token0LogoUri} />{' '}
                      <span className={'text-xs ml-2 mr-2'}>{item.token0Amount}</span> /
                      <CurrencyLogo size="24px" className={'ml-2'} src={item.token1LogoUri} />{' '}
                      <span className={'text-xs ml-2'}>{item.token1Amount}</span>
                    </div>
                  </div>
                </Cell>
                <Cell>{`${item.poolShare} %`}</Cell>
                <Cell>{item.paxEarnedToday}</Cell>
                <Cell>{item.lpTokenAmount}</Cell>
                <Cell>
                  <div className={'flex items-center justify-center gap-6'}>
                    <Link
                      to={getLinkHref(item, 'add')}
                      className={
                        'text-lemonYellow w-[60px] flex items-center justify-center h-6 border rounded-sm border-lemonYellow'
                      }
                    >
                      {'+ADD'}
                    </Link>
                    <Link
                      to={getLinkHref(item, 'remove')}
                      className={
                        'text-lemonYellow flex-grow flex-shrink-0 w-[88px] flex items-center justify-center h-6 border rounded-sm border-lemonYellow'
                      }
                    >
                      {'—REMOVE'}
                    </Link>
                  </div>
                </Cell>
              </Row>
            </Fragment>
          )}
        </TableBody>
      </Table>
      <ModalOverlay
        className={
          'fixed left-0 top-0 z-20 flex h-[--visual-viewport-height] w-screen items-start justify-center bg-black/50 data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in data-[exiting]:fade-out'
        }
        isOpen={isOpen}
        isDismissable
        onOpenChange={(open) => {
          setOpen(open)
        }}
      >
        <Modal
          className={
            'relative top-[192px] w-full max-w-[800px] h-[200px] rounded-md bg-[#1D252E] outline-none data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:zoom-in-75 data-[exiting]:zoom-out-75'
          }
        >
          <div className={'h-full flex pl-[32px] pt-[20px] pb-[20px] flex-col justify-around'}>
            <div className={'flex cursor-pointer'}>
              <Checkbox
                isSelected={selectedFlagOne}
                onChange={(isSelected) => {
                  setSelectedFlagOne(isSelected)
                }}
                className={'flex cursor-pointer'}
              >
                {selectedFlagOne === true ? (
                  <>
                    <div className={'w-[34px] h-[20px] rounded border border-[#FFC300] flex items-center justify-end'}>
                      <span className={'w-[12px] h-[12px] rounded-[2px] bg-[#FFC300] inline-block mr-[3px]'}></span>
                    </div>
                    <span className={'text-sm pl-[32px] text-[#FFC300]'}>
                      Convert all profits earned from PackEX to $PAX automatically
                    </span>
                  </>
                ) : (
                  <>
                    <div
                      className={'w-[34px] h-[20px] rounded border border-[#AAAAAA] flex items-center justify-start'}
                    >
                      <span className={'w-[12px] h-[12px] rounded-[2px] bg-[#AAAAAA] inline-block ml-[3px]'}></span>
                    </div>
                    <span className={'text-sm pl-[32px]'}>
                      Convert all profits earned from PackEX to $PAX automatically
                    </span>
                  </>
                )}
              </Checkbox>
            </div>
            <div className={'flex cursor-pointer'}>
              <Checkbox
                isSelected={selectedFlagTwo}
                onChange={(isSelected) => {
                  setSelectedFlagTwo(isSelected)
                }}
                className={'flex cursor-pointer'}
              >
                {selectedFlagTwo === true ? (
                  <>
                    <div className={'w-[34px] h-[20px] rounded border border-[#FFC300] flex items-center justify-end'}>
                      <span className={'w-[12px] h-[12px] rounded-[2px] bg-[#FFC300] inline-block mr-[3px]'}></span>
                    </div>
                    <span className={'text-sm pl-[32px] text-[#FFC300]'}>
                      Add your $PAX and USDB balances to the liquidity pool automatically
                    </span>
                  </>
                ) : (
                  <>
                    <div
                      className={'w-[34px] h-[20px] rounded border border-[#AAAAAA] flex items-center justify-start'}
                    >
                      <span className={'w-[12px] h-[12px] rounded-[2px] bg-[#AAAAAA] inline-block ml-[3px]'}></span>
                    </div>
                    <span className={'text-sm pl-[32px]'}>
                      Add your $PAX and USDB balances to the liquidity pool automatically
                    </span>
                  </>
                )}
              </Checkbox>
            </div>
          </div>
        </Modal>
      </ModalOverlay>
    </PoolLayout>
  )
}

export default PoolMy

function getLinkHref(item: PoolMyItem, type: 'add' | 'remove') {
  if (item.token0Name.toLowerCase() === 'weth') {
    return `/pool/${type}/eth/${item.token1Contract}`
  }
  if (item.token1Name.toLowerCase() === 'weth') {
    return `/pool/${type}/${item.token0Contract}/eth`
  }
  return `/pool/${type}/${item.token0Contract}/${item.token1Contract}`
}
