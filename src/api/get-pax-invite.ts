import { PaxTableData } from '@/api/get-pax-info'
import { usePaxInvite } from '@/state/user/hooks'
import fetcher from '@/utils/fetcher'
import { isEqual } from 'lodash-es'
import { useEffect } from 'react'

export type GetPaxInviteData = {
  inviteCode: string
  invite: PaxTableData[]
}

function getPaxInvite() {
  return fetcher<GetPaxInviteData>('/get-pax-invite', {
    method: 'GET',
  })
}

export const useFetchPaxInvite = () => {
  const [data, updateData] = usePaxInvite()

  useEffect(() => {
    getPaxInvite().then((data) => {
      updateData((prev) => {
        if (isEqual(data, prev)) return prev
        if (data.invite) {
          data.invite = data.invite.map((item, index) => ({
            ...item,
            rank: index + 1,
          }))
        }
        return data
      })
    })
  }, [updateData])

  return data
}
