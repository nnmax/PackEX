import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateUserDeadline, updateUserSlippageTolerance } from './actions'
import type { AppDispatch, AppState } from '../index'

export function useUserSlippageTolerance(): [number, (slippage: number) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const userSlippageTolerance = useSelector<AppState, AppState['user']['userSlippageTolerance']>((state) => {
    return state.user.userSlippageTolerance
  })

  const setUserSlippageTolerance = useCallback(
    (_userSlippageTolerance: number) => {
      dispatch(updateUserSlippageTolerance({ userSlippageTolerance: _userSlippageTolerance }))
    },
    [dispatch],
  )

  return [userSlippageTolerance, setUserSlippageTolerance]
}

export function useUserDeadline(): [number, (slippage: number) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const userDeadline = useSelector<AppState, AppState['user']['userDeadline']>((state) => {
    return state.user.userDeadline
  })

  const setUserDeadline = useCallback(
    (_userDeadline: number) => {
      dispatch(updateUserDeadline({ userDeadline: _userDeadline }))
    },
    [dispatch],
  )

  return [userDeadline, setUserDeadline]
}
