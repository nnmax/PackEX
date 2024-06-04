import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Cell, Column, Row, Table, TableBody, TableHeader, ModalOverlay, Modal, Checkbox } from 'react-aria-components'
import clsx from 'clsx'
import { isEqual } from 'lodash-es'
import { getAllPools, AllPoolListData, PoolAllItem } from '@/api'
import { usePoolAllList } from '@/state/user/hooks'
// import GearIcon from '@/components/Icons/GearIcon'
// import SortIcon from '@/components/Icons/sortIcon'
import PoolLayout from '@/pages/Pool/Layout'

const PoolAll = () => {
  const [isOpen, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedFlagOne, setSelectedFlagOne] = useState<boolean>(true)
  const [selectedFlagTwo, setSelectedFlagTwo] = useState<boolean>(false)
  const [poolAllList, updatePoolAllList] = usePoolAllList()

  useEffect(() => {
    getAllPools()
      .then((data: AllPoolListData) => {
        updatePoolAllList((prev) => {
          if (isEqual(prev, data.allPools)) return prev
          return data.allPools
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [updatePoolAllList])

  // function GearIconLogo() {
  //   return (
  //     <div
  //       onClick={() => {
  //         setOpen(true)
  //       }}
  //       className={'h-5 w-5 absolute left-[-30px] rounded-full cursor-pointer'}
  //     >
  //       <GearIcon className={'h-full w-full rounded-full'} />
  //     </div>
  //   )
  // }

  return (
    <PoolLayout activeTab={'all'}>
      <Table aria-label={'Assets'} className={'w-full text-center text-xs'}>
        <TableHeader
          className={clsx('h-12 text-[#9E9E9E] [&_th]:font-normal', { loading: loading && poolAllList.length <= 0 })}
        >
          <Column isRowHeader>{'POOL NAME'}</Column>
          <Column>
            <span className={'relative'}>
              {'TVL '}
              {/* <SortIcon className={'inline'} /> */}
            </span>
          </Column>
          <Column>{'VOLUME (24H)'}</Column>
          <Column>{'VOLUME (7D)'}</Column>
          <Column>{'APR'}</Column>
          <Column>{'ACTION'}</Column>
        </TableHeader>
        <TableBody items={poolAllList} className={'[&>tr]:h-[76px] [&>tr]:border-b [&>tr]:border-[#333]'}>
          {(item) => (
            <Row id={item.id} className={'[&>td]:px-3 [&>td]:pt-4 [&>td]:max-w-[100px]'}>
              <Cell>
                <div className={'flex items-center justify-center'}>
                  <div className={'flex items-center relative'}>
                    {/* {item.id === 1 && <GearIconLogo />} */}
                    <img className={'relative h-6 w-6 rounded-full'} src={item.token0LogoUri} alt="logo0" />
                    <img className={'relative h-6 w-6 rounded-full mr-4'} src={item.token1LogoUri} alt="logo1" />
                  </div>
                  <span className={'text-xs mr-2'}>{item.token0Name}</span> /
                  <span className={'text-xs ml-2'}>{item.token1Name}</span>
                </div>
              </Cell>
              <Cell>{item.tvl}</Cell>
              <Cell>{item.volume24h}</Cell>
              <Cell>{item.volume7d}</Cell>
              <Cell>{`${item.apr} %`}</Cell>
              <Cell>
                <Link
                  to={getLinkHref(item)}
                  className={
                    'text-lemonYellow inline-block w-[60px] h-6 leading-5 border rounded-sm border-lemonYellow'
                  }
                >
                  {'+ADD'}
                </Link>
              </Cell>
            </Row>
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

export default PoolAll

function getLinkHref(item: PoolAllItem) {
  if (item.token0Name.toLowerCase() === 'weth') {
    return `/pool/add/eth/${item.token1Contract}`
  }
  if (item.token1Name.toLowerCase() === 'weth') {
    return `/pool/add/${item.token0Contract}/eth`
  }
  return `/pool/add/${item.token0Contract}/${item.token1Contract}`
}
