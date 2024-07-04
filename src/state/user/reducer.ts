import { INITIAL_ALLOWED_SLIPPAGE, DEFAULT_DEADLINE_FROM_NOW } from '../../constants'
import { createReducer } from '@reduxjs/toolkit'
import { updateVersion } from '../global/actions'
import { updateUserSlippageTolerance, updateUserDeadline } from './actions'

export interface UserState {
  // user defined slippage tolerance in bips, used in all txns
  userSlippageTolerance: number
  // deadline set by user in minutes, used in all txns
  userDeadline: number
}

export const initialState: UserState = {
  userSlippageTolerance: INITIAL_ALLOWED_SLIPPAGE,
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateVersion, (state) => {
      // slippage isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard
      if (typeof state.userSlippageTolerance !== 'number') {
        state.userSlippageTolerance = INITIAL_ALLOWED_SLIPPAGE
      }

      // deadline isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard
      if (typeof state.userDeadline !== 'number') {
        state.userDeadline = DEFAULT_DEADLINE_FROM_NOW
      }
    })
    .addCase(updateUserSlippageTolerance, (state, action) => {
      state.userSlippageTolerance = action.payload.userSlippageTolerance
    })
    .addCase(updateUserDeadline, (state, action) => {
      state.userDeadline = action.payload.userDeadline
    }),
)
