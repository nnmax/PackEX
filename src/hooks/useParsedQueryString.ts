import { parse } from 'qs'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import type { ParsedQs } from 'qs'

export default function useParsedQueryString(): ParsedQs {
  const { search } = useLocation()
  return useMemo(
    () => (search && search.length > 1 ? parse(search, { parseArrays: false, ignoreQueryPrefix: true }) : {}),
    [search],
  )
}
