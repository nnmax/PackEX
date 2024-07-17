import { MaxUint256 } from 'ethers'
import { TokenAmount, ETHER } from '@nnmax/uniswap-sdk-v2'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { ROUTER_ADDRESS } from '../constants'
import { useTokenAllowance } from '../data/Allowances'
import { Field } from '../state/swap/actions'
import { useTransactionAdder, useHasPendingApproval } from '../state/transactions/hooks'
import { computeSlippageAdjustedAmounts } from '../utils/prices'
import { calculateGasMargin } from '../utils'
import { useTokenContract } from './useContract'
import type { Trade, CurrencyAmount} from '@nnmax/uniswap-sdk-v2';
import type { TransactionResponse} from 'ethers';

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  amountToApprove?: CurrencyAmount,
  spender?: string,
): [ApprovalState, () => Promise<void>, bigint | undefined] {
  const { address } = useAccount()
  const token = amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined
  const currentAllowance = useTokenAllowance(token, address ?? undefined, spender)
  const pendingApproval = useHasPendingApproval(token?.address, spender)
  const [estimatedGas, setEstimateGas] = useState<bigint>()

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency === ETHER) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval, spender])

  const tokenContract = useTokenContract(token?.address)
  const addTransaction = useTransactionAdder()

  const getGas = useCallback(
    async function getGas() {
      if (approvalState !== ApprovalState.NOT_APPROVED && approvalState !== ApprovalState.UNKNOWN) {
        console.error(`approve was called unnecessarily (approvalState: ${approvalState})`)
        return
      }
      if (!token) {
        console.error('no token')
        return
      }

      if (!tokenContract) {
        console.error('tokenContract is null')
        return
      }

      if (!amountToApprove) {
        console.error('missing amount to approve')
        return
      }

      if (!spender) {
        console.error('no spender')
        return
      }

      const [_estimatedGas, _useExact] = await tokenContract.approve
        .estimateGas(spender, MaxUint256)
        .then((value) => {
          return [value, false] as const
        })
        .catch(async () => {
          // general fallback for tokens who restrict approval amounts
          return [await tokenContract.approve.estimateGas(spender, amountToApprove.raw.toString()), true] as const
        })
      setEstimateGas(_estimatedGas)
      return [_estimatedGas, _useExact] as const
    },
    [amountToApprove, approvalState, spender, token, tokenContract],
  )

  useEffect(() => {
    getGas().catch(() => {})
  }, [getGas])

  const approve = useCallback(async (): Promise<void> => {
    const res = await getGas()
    if (!res) return
    const [_estimatedGas, _useExact] = res

    return tokenContract!
      .approve(spender, _useExact ? amountToApprove!.raw.toString() : MaxUint256, {
        gasLimit: calculateGasMargin(_estimatedGas),
      })
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: 'Approve ' + amountToApprove!.currency.symbol,
          approval: { tokenAddress: token!.address, spender: spender! },
        })
      })
  }, [addTransaction, amountToApprove, getGas, spender, token, tokenContract])

  return [approvalState, approve, estimatedGas]
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(trade?: Trade, allowedSlippage = 0) {
  const amountToApprove = useMemo(
    () => (trade ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT] : undefined),
    [trade, allowedSlippage],
  )
  return useApproveCallback(amountToApprove, ROUTER_ADDRESS)
}
