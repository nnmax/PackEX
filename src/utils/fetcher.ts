import { toast } from 'react-toastify'
import type { CommonResponse } from '@/api/types'
import { disconnectWallet } from '@/api'
import { API_BASE } from '@/constants'

interface FetcherOptions<ResponseData> extends RequestInit {
  disabledErrorToast?: boolean | ((response: CommonResponse<ResponseData>) => boolean)
  disabled401?: boolean
}

export default function fetcher<ResponseData = unknown>(input: string, options?: FetcherOptions<ResponseData>) {
  const { disabledErrorToast, disabled401, ...rest } = options || {}
  return fetch(API_BASE + input, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...rest?.headers,
    },
  })
    .then<CommonResponse<ResponseData>>(async (response) => {
      if (response.ok) {
        return response.json()
      }
      const errorMessage = await response.text()
      toast.error(errorMessage)
      throw new Error(errorMessage)
    })
    .then((data) => {
      if (data.code === 200) {
        return data.data
      }
      if (data.code === 401 && !disabled401) {
        disconnectWallet().catch(() => {})
        throw data
      }
      if (disabledErrorToast === true || (typeof disabledErrorToast === 'function' && disabledErrorToast(data))) {
        throw data
      }
      if (!disabledErrorToast) {
        toast.error(data.prompt)
        throw data
      }
      return data.data
    })
    .catch((error) => {
      console.error(error)
      throw error
    })
}
