import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Fragment } from 'react'
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  ModalOverlay,
  Modal,
  Checkbox,
  ResizableTableContainer,
} from 'react-aria-components'
import clsx from 'clsx'
import PoolLayout from '@/pages/Pool/Layout'
import { useMyPools } from '@/api/get-my-pools'
import CurrencyLogo from '@/components/CurrencyLogo'
import { getLinkPathname } from '@/pages/Pool/utils'
import useDocumentTitle from '@/hooks/useDocumentTitle'
import { isNumber } from 'lodash-es'
import Tooltip from '@/components/Tooltip'

const PoolMy = () => {
  const [isOpen, setOpen] = useState<boolean>(false)
  const [selectedFlagOne, setSelectedFlagOne] = useState<boolean>(true)
  const [selectedFlagTwo, setSelectedFlagTwo] = useState<boolean>(false)
  const { data, isLoading } = useMyPools()

  const location = useLocation()
  useDocumentTitle('My Pools')

  return (
    <PoolLayout activeTab={'my'}>
      <ResizableTableContainer className="w-full">
        <Table aria-label={'Assets'} className={'w-full text-center text-xs'}>
          <TableHeader className={clsx('h-12 text-[#9E9E9E] [&_th]:font-normal')}>
            <Column width={100} className={'text-start'} isRowHeader>
              {'POOL NAME'}
            </Column>
            <Column>{'AMOUNT'}</Column>
            <Column width={148}>{'POOL SHARE'}</Column>
            <Column width={180} className={'pt-[15px]'}>
              {'PAX EARNED'}
              <br />
              {'(TODAY)'}
            </Column>
            <Column width={160}>{'MY LP TOKEN'}</Column>
            <Column width={180}>{''}</Column>
          </TableHeader>
          <TableBody
            renderEmptyState={
              isLoading
                ? () => <span className={clsx({ 'loading text-2xl': isLoading })} />
                : () => <p className={'mt-2 text-sm text-[#9e9e9e]'}>{'NO DATA'}</p>
            }
            items={data?.myPools}
            className={clsx('[&>tr]:h-[76px] [&>tr]:border-b [&>tr]:border-[#333]')}
          >
            {(item) => (
              <Fragment key={item.id}>
                <Row id={item.id} className={'[&>td]:pt-4'}>
                  <Cell>
                    <div className={'flex items-center'}>
                      <span className={'text-xs mr-2'}>{item.token0Name}</span> /
                      <span className={'text-xs ml-2'}>{item.token1Name}</span>
                    </div>
                  </Cell>
                  <Cell>
                    <div className={'flex items-center justify-center'}>
                      <CurrencyLogo size="24px" src={item.token0LogoUri} />{' '}
                      <Tooltip title={item.token0Amount}>
                        <span className={'text-xs ml-2 mr-2 truncate'}>{item.token0Amount}</span>
                      </Tooltip>{' '}
                      /
                      <CurrencyLogo size="24px" className={'ml-2'} src={item.token1LogoUri} />{' '}
                      <Tooltip title={item.token1Amount}>
                        <span className={'text-xs ml-2 truncate'}>{item.token1Amount}</span>
                      </Tooltip>
                    </div>
                  </Cell>
                  <Cell>{`${item.poolShare} %`}</Cell>
                  <Cell>{item.paxEarnedToday}</Cell>
                  <Cell>{formatLpToken(item.lpTokenAmount)}</Cell>
                  <Cell>
                    <div className={'flex items-center justify-center gap-6'}>
                      <Link
                        to={getLinkPathname(item, 'add')}
                        state={{
                          location,
                        }}
                        className={
                          'text-lemonYellow w-[60px] flex items-center justify-center h-6 border rounded-sm border-lemonYellow'
                        }
                      >
                        {'+ADD'}
                      </Link>
                      <Link
                        to={getLinkPathname(item, 'remove')}
                        state={{
                          location,
                        }}
                        className={
                          'text-lemonYellow w-[88px] flex items-center justify-center h-6 border rounded-sm border-lemonYellow'
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
      </ResizableTableContainer>
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

function formatLpToken(lpTokenAmount: number | null) {
  if (isNumber(lpTokenAmount)) {
    if (lpTokenAmount === 0) return '0'
    if (lpTokenAmount < 0.01) return '< 0.01'
    return lpTokenAmount.toFixed(2)
  }
  return '-'
}
