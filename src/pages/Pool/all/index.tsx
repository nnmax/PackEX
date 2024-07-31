import { Link, useLocation } from 'react-router-dom'
import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components'
import clsx from 'clsx'
import { useAllPools } from '@/api'
import PoolLayout from '@/pages/Pool/Layout'
import { getLinkPathname } from '@/pages/Pool/utils'
import useDocumentTitle from '@/hooks/useDocumentTitle'

const PoolAll = () => {
  const { data: poolAllList, isLoading } = useAllPools()
  const location = useLocation()
  useDocumentTitle('All Pools')

  return (
    <PoolLayout activeTab={'all'}>
      <Table aria-label={'Assets'} className={'w-full text-center text-xs mx-8'}>
        <TableHeader className={clsx('h-12 text-[#9E9E9E] [&_th]:font-normal')}>
          <Column className={'text-start pl-12'} isRowHeader>
            {'POOL NAME'}
          </Column>
          <Column>
            <span className={'relative'}>{'TVL '}</span>
          </Column>
          <Column>{'VOLUME (24H)'}</Column>
          <Column>{'VOLUME (7D)'}</Column>
          <Column>{'APY'}</Column>
          <Column className={'text-end'}>{'ACTION'}</Column>
        </TableHeader>
        <TableBody
          renderEmptyState={
            isLoading
              ? () => <span className={clsx({ 'loading text-2xl': isLoading })} />
              : () => <p className={'mt-2 text-sm text-[#9e9e9e]'}>{'NO DATA'}</p>
          }
          items={poolAllList?.allPools}
          className={clsx('[&>tr]:h-[76px] [&>tr]:border-b [&>tr]:border-[#333]')}
        >
          {(item) => (
            <Row id={item.id} className={'[&>td]:pt-4'}>
              <Cell>
                <div className={'flex items-center'}>
                  <div className={'flex'}>
                    <img className={'relative h-6 w-6 rounded-full'} src={item.token0LogoUri} alt={'logo0'} />
                    <img className={'relative h-6 w-6 rounded-full mr-4'} src={item.token1LogoUri} alt={'logo1'} />
                  </div>
                  <span className={'text-xs mr-2'}>{item.token0Name}</span> {'/'}
                  <span className={'text-xs ml-2'}>{item.token1Name}</span>
                </div>
              </Cell>
              <Cell>{item.tvl}</Cell>
              <Cell>{item.volume24h}</Cell>
              <Cell>{item.volume7d}</Cell>
              <Cell>{'-' /* `${item.apy}%` */}</Cell>
              <Cell className={'text-end'}>
                <Link
                  to={getLinkPathname(item, 'add')}
                  state={{
                    location,
                  }}
                  className={
                    'text-lemonYellow inline-block text-center w-[60px] h-6 leading-5 border rounded-sm border-lemonYellow'
                  }
                >
                  {'+ADD'}
                </Link>
              </Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </PoolLayout>
  )
}

export default PoolAll
