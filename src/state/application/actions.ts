import { createAction } from '@reduxjs/toolkit'

export const updateBlockNumber = createAction<{ chainId: number; blockNumber: number }>('app/updateBlockNumber')
export const toggleWalletModal = createAction<void>('app/toggleWalletModal')
export const toggleBTCWalletModal = createAction<void>('app/toggleBTCWalletModal')
