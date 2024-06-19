import { PaxTableData } from '@/api/get-pax-info'
import fetcher from '@/utils/fetcher'
import { useQuery } from '@tanstack/react-query'

export type Bonus = {
  id: number
  userId: number | null
  tokenId: number | null
  bonusAmount: number
  claimedFlag: null
  createTime: null
  symbol: string
  decimals: number
  showDecimals: number
  logoUri: string
}

export type GetPaxInviteData = {
  inviteCode: string
  invite: PaxTableData[]
  unclaimed: number
  totalMinted: number
  unclaimedBonusList: Bonus[]
  dailyBonusList: Bonus[]
  totalBonusList: Bonus[]
}

function getPaxInvite() {
  return fetcher<GetPaxInviteData>('/get-pax-invite', {
    method: 'GET',
  }).then((res) => {
    if (Array.isArray(res.invite)) {
      return {
        ...res,
        invite: res.invite.map((item, index) => ({
          ...item,
          rank: index + 1,
        })),
      }
    }
    return res
  })
}

export const usePaxInvite = () => {
  return useQuery({
    queryKey: ['get-pax-invite'],
    queryFn: getPaxInvite,
  })
}
