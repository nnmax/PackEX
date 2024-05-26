import { Asset, PoolMyItem, PoolAllItem, ConnectWalletData, GetPaxInviteData } from '@/api'
import { GetPaxInfoData } from '@/api/get-pax-info'
import { createAction } from '@reduxjs/toolkit'

export interface SerializedToken {
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
}

export interface SerializedPair {
  token0: SerializedToken
  token1: SerializedToken
}

export const updateUserExpertMode = createAction<{ userExpertMode: boolean }>('user/updateUserExpertMode')
export const updateUserSlippageTolerance = createAction<{ userSlippageTolerance: number }>(
  'user/updateUserSlippageTolerance',
)
export const updateUserDeadline = createAction<{ userDeadline: number }>('user/updateUserDeadline')
export const addSerializedToken = createAction<{ serializedToken: SerializedToken }>('user/addSerializedToken')
export const removeSerializedToken = createAction<{ chainId: number; address: string }>('user/removeSerializedToken')
export const addSerializedPair = createAction<{ serializedPair: SerializedPair }>('user/addSerializedPair')
export const removeSerializedPair = createAction<{ chainId: number; tokenAAddress: string; tokenBAddress: string }>(
  'user/removeSerializedPair',
)
export const updateUserInfo = createAction<ConnectWalletData | null>('user/updateUserInfo')
export const updateAssetsList = createAction<{ assetsList: Asset[] }>('user/updateAssetsList')
export const updateTotalValue = createAction<{ totalValue: number }>('user/updateTotalValue')
export const updatePoolMyList = createAction<{ poolMyList: PoolMyItem[] }>('user/updatePoolMyList')
export const updatePoolAllList = createAction<{ poolAllList: PoolAllItem[] }>('user/updatePoolAllList')
export const updatePaxInvite = createAction<GetPaxInviteData | null>('user/updatePaxInvite')
export const updatePaxInfo = createAction<GetPaxInfoData | null>('user/updatePaxInfo')
