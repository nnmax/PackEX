import { toast } from 'react-toastify'
import type { CommonResponse } from '@/api/types'
import { disconnectWallet } from '@/api'
import { API_BASE } from '@/constants'

interface FetcherOptions<ResponseData> extends RequestInit {
  disabledErrorToast?: boolean | ((response: CommonResponse<ResponseData>) => boolean)
}

export default function fetcher<ResponseData = unknown>(input: string, options?: FetcherOptions<ResponseData | null>) {
  const { disabledErrorToast, ...rest } = options || {}

  return fetch(API_BASE + input, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...rest?.headers,
    },
  })
    .then<CommonResponse<ResponseData>>(async (response) => {
      if (response.ok) return response.json()
      const parsed = await response.json().catch(() => ({}))
      const errorMessage = response.statusText || parsed.error || 'Request failed'
      if (
        disabledErrorToast === true ||
        (typeof disabledErrorToast === 'function' && disabledErrorToast(response as any))
      ) {
        throw new Error(errorMessage)
      }
      toast.error(errorMessage)
      throw new Error(errorMessage)
    })
    .then((data) => {
      if (data.code === 200) {
        return data.data
      }
      if (data.code === 401 && input !== '/disconnect-wallet') {
        disconnectWallet().catch(() => {})
      }
      const errMsg = data.prompt || data.message || 'Request failed'
      if (
        data.code === 401 ||
        disabledErrorToast === true ||
        (typeof disabledErrorToast === 'function' && disabledErrorToast(data))
      ) {
        throw new Error(errMsg)
      }
      toast.error(errMsg)
      throw new Error(errMsg)
    })
    .catch((error) => {
      console.error(error)
      throw error
    })
}
