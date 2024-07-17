import { useQuery } from '@tanstack/react-query'
import fetcher from '@/utils/fetcher'

interface PointGoldInfo {
  pointAmount: number
  goldAmount: number
}

export default function usePointGold() {
  return useQuery({
    queryKey: ['get-point-gold-info'],
    queryFn: () =>
      fetcher<PointGoldInfo>('/get-point-gold-info', {
        method: 'GET',
        disabledErrorToast: true,
      }),
  })
}
