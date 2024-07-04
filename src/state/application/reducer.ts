import { createReducer } from '@reduxjs/toolkit'
import { toggleWalletModal, updateBlockNumber, toggleBTCWalletModal } from './actions'

export interface ApplicationState {
  blockNumber: { [chainId: number]: number }
  walletModalOpen: boolean
  btcWalletModalOpen: boolean
}

const initialState: ApplicationState = {
  blockNumber: {},
  walletModalOpen: false,
  btcWalletModalOpen: false,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateBlockNumber, (state, action) => {
      const { chainId, blockNumber } = action.payload
      if (typeof state.blockNumber[chainId] !== 'number') {
        state.blockNumber[chainId] = blockNumber
      } else {
        state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId])
      }
    })
    .addCase(toggleWalletModal, (state) => {
      state.walletModalOpen = !state.walletModalOpen
    })
    .addCase(toggleBTCWalletModal, (state) => {
      state.btcWalletModalOpen = !state.btcWalletModalOpen
    }),
)
