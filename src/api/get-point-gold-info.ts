import fetcher from '@/utils/fetcher'
import { useQuery } from '@tanstack/react-query'

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
