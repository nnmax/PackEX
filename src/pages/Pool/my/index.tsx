import { Link, useLocation } from 'react-router-dom'
import { Fragment } from 'react'
import { Cell, Column, Row, Table, TableBody, TableHeader, ResizableTableContainer } from 'react-aria-components'
import clsx from 'clsx'
import { isNumber } from 'lodash-es'
import PoolLayout from '@/pages/Pool/Layout'
import { useMyPools } from '@/api/get-my-pools'
import CurrencyLogo from '@/components/CurrencyLogo'
import { getLinkPathname } from '@/pages/Pool/utils'
import useDocumentTitle from '@/hooks/useDocumentTitle'
import Tooltip from '@/components/Tooltip'

const PoolMy = () => {
  const { data, isLoading } = useMyPools()

  const location = useLocation()
  useDocumentTitle('My Pools')

  return (
    <PoolLayout activeTab={'my'}>
      <ResizableTableContainer className={'w-full'}>
        <Table aria-label={'Assets'} className={'w-full text-center text-xs'}>
          <TableHeader className={clsx('h-12 text-[#9E9E9E] [&_th]:font-normal')}>
            <Column width={100} className={'text-start'} isRowHeader>
              {'POOL NAME'}
            </Column>
            <Column minWidth={260}>{'AMOUNT'}</Column>
            <Column width={148}>{'POOL SHARE'}</Column>
            {/* <Column width={180} className={'pt-[15px]'}>
              {'CONTRIBUTION '}
              <br />
              {'( TODAY )'}
            </Column> */}
            <Column width={160}>{'LP TOKEN'}</Column>
            <Column maxWidth={180} minWidth={100}>
              {''}
            </Column>
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
                      <span className={'text-xs mr-2'}>{item.token0Name}</span> {'/'}
                      <span className={'text-xs ml-2'}>{item.token1Name}</span>
                    </div>
                  </Cell>
                  <Cell>
                    <div className={'flex items-center justify-center'}>
                      <CurrencyLogo size={'24px'} src={item.token0LogoUri} />{' '}
                      <Tooltip title={item.token0Amount}>
                        <span className={'text-xs ml-2 mr-2 truncate'}>{item.token0Amount}</span>
                      </Tooltip>{' '}
                      {'/'}
                      <CurrencyLogo size={'24px'} className={'ml-2'} src={item.token1LogoUri} />{' '}
                      <Tooltip title={item.token1Amount}>
                        <span className={'text-xs ml-2 truncate'}>{item.token1Amount}</span>
                      </Tooltip>
                    </div>
                  </Cell>
                  <Cell>{`${item.poolShare?.toFixed(2)} %`}</Cell>
                  {/* <Cell>{`${item.paxEarnedToday?.toFixed(1)} $`}</Cell> */}
                  <Cell>{formatLpToken(item.lpTokenAmount)}</Cell>
                  <Cell>
                    <div className={'flex items-center justify-center gap-x-4 gap-y-2 flex-wrap'}>
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
