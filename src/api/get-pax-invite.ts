import { PaxTableData } from '@/api/get-pax-info'
import fetcher from '@/utils/fetcher'
import { useQuery } from '@tanstack/react-query'

export type GetPaxInviteData = {
  inviteCode: string
  invite: PaxTableData[]
  unclaimed: number
  totalMinted: number
}

function getPaxInvite() {
  return fetcher<GetPaxInviteData>('/get-pax-invite', {
    method: 'GET',
  })
}

export const usePaxInvite = () => {
  return useQuery({
    queryKey: ['get-pax-invite'],
    queryFn: getPaxInvite,
  })
}
