import { PoolAllItem, PoolMyItem } from '@/api'

export function getLinkPathname(item: PoolMyItem | PoolAllItem, type: 'add' | 'remove') {
  const getPathname = (token0: string, token1: string) => {
    if (type === 'add') return `/pool/add/${token0}/${token1}`
    return `/pool/remove/${token0}/${token1}`
  }

  if (item.token0Name.toLowerCase() === 'weth') return getPathname('eth', item.token1Contract)
  if (item.token1Name.toLowerCase() === 'weth') return getPathname(item.token0Contract, 'eth')
  return getPathname(item.token0Contract, item.token1Contract)
}
