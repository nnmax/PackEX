import { useQuery } from '@tanstack/react-query'
import { uniqueId } from 'lodash-es'
import fetcher from '@/utils/fetcher'
import type { PaxTableData } from '@/api/get-pax-info'

export interface Bonus {
  bonusAmount: number
  symbol: string
  logoUri: string
}

export interface GetPaxInviteData {
  inviteCode: string
  inviteList: PaxTableData[]
  userPax?: PaxTableData
  unclaimedBonusList: Bonus[]
  dailyBonusList: Bonus[]
  totalBonusList: Bonus[]
}

function getPaxInvite() {
  return fetcher<GetPaxInviteData>('/get-pax-invite', {
    method: 'GET',
  }).then((res) => {
    const result = { ...res }
    if (Array.isArray(result.inviteList)) {
      result.inviteList = result.inviteList.map((item, index) => ({
        ...item,
        rank: index + 1,
        id: uniqueId('pax-table-'),
      }))
    }
    if (result.userPax) {
      result.userPax = {
        ...result.userPax,
        id: uniqueId('userPax-'),
      }
    }
    return result
  })
}

export const usePaxInvite = () => {
  return useQuery({
    queryKey: ['get-pax-invite'],
    queryFn: getPaxInvite,
  })
}
