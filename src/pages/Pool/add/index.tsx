import { Link, useNavigate, useLocation, useParams } from 'react-router-dom'
import { ETHER } from '@nnmax/uniswap-sdk-v2'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAccount, useChainId } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft'
import CurrencyInputPanel from '@/components/CurrencyInputPanel'
import AddIcon from '@/assets/images/add.png'
import SlippageSetting from '@/components/SlippageSetting'
import { Field } from '@/state/mint/actions'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '@/state/mint/hooks'
import { useCurrency } from '@/hooks/Tokens'
import { useUserDeadline, useUserSlippageTolerance } from '@/state/user/hooks'
import { maxAmountSpend } from '@/utils/maxAmountSpend'
import { ApprovalState, useApproveCallback } from '@/hooks/useApproveCallback'
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '@/utils'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import { DEFAULT_GAS, ROUTER_ADDRESS } from '@/constants'
import { ButtonPrimary, ConnectWalletButton, SwitchChainButton } from '@/components/Button'
import ReviewModal from '@/components/Pool/ReviewModal'
import { useEthersProvider } from '@/hooks/useEthersProvider'
import useIsSupportedChainId from '@/hooks/useIsSupportedChainId'
import { currencyId } from '@/utils/currencyId'
import { PairState } from '@/data/Reserves'
import useDocumentTitle from '@/hooks/useDocumentTitle'
import useIntervalTxAndHandle from '@/hooks/useIntervalTxAndHandle'
import { useTransactionInProgressModalOpen } from '@/state/transactions/hooks'
import { TransactionSuccessModal } from '@/components/TransactionModal'
import type { ChainId, Currency, TokenAmount } from '@nnmax/uniswap-sdk-v2'
import type { TransactionResponse } from 'ethers'

export default function PoolAdd() {
  const navigate = useNavigate()
  const { currencyIdA, currencyIdB } = useParams<{
    currencyIdA: string
    currencyIdB: string
  }>()
  const { address: account } = useAccount()
  const chainId: ChainId = useChainId()
  const provider = useEthersProvider()
  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)
  useDocumentTitle('Add Liquidity')
  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState()
  const {
    dependentField,
    currencies,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    poolTokenPercentage,
    liquidityMinted,
    error,
    fieldAError,
    fieldBError,
    pairState,
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)
  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)
  const isSupportedChainId = useIsSupportedChainId()
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)

  // txn values
  const [deadline] = useUserDeadline() // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users
  const [txHash, setTxHash] = useState<string>('')

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field]),
      }
    },
    {},
  )

  const atMaxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
      }
    },
    {},
  )

  const { state: _state, pathname } = useLocation()
  const state = _state as { location: ReturnType<typeof useLocation> } | undefined
  const goBack = state?.location ?? '/pool/all'

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_A], ROUTER_ADDRESS)
  const [approvalB, approveBCallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_B], ROUTER_ADDRESS)

  const onAdd = useCallback(async () => {
    if (!chainId || !provider || !account) return
    const router = await getRouterContract(chainId, provider, account)

    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB) {
      return
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0],
    }

    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline

    let estimate,
      method: (...args: any) => Promise<TransactionResponse>,
      args: (string | string[] | number)[],
      value: bigint | null
    if (currencyA === ETHER || currencyB === ETHER) {
      const tokenBIsETH = currencyB === ETHER
      estimate = router.addLiquidityETH.estimateGas
      method = router.addLiquidityETH
      args = [
        wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address ?? '', // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
        amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(), // token min
        amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(), // eth min
        account,
        deadlineFromNow,
      ]
      value = BigInt((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString())
    } else {
      estimate = router.addLiquidity.estimateGas
      method = router.addLiquidity
      args = [
        wrappedCurrency(currencyA, chainId)?.address ?? '',
        wrappedCurrency(currencyB, chainId)?.address ?? '',
        parsedAmountA.raw.toString(),
        parsedAmountB.raw.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        deadlineFromNow,
      ]
      value = null
    }

    await estimate(...args, value ? { value } : {})
      .catch((err) => {
        console.dir(err)
        return DEFAULT_GAS
      })
      .then((estimatedGasLimit) =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit),
        }).then((response) => {
          setTxHash(response.hash)
        }),
      )
      .catch((_error) => {
        // we only care if the error is something _other_ than the user rejected the tx
        if (_error?.code !== 4001) {
          console.error(_error)
        }
        throw _error
      })
  }, [account, allowedSlippage, chainId, currencyA, currencyB, deadline, provider, noLiquidity, parsedAmounts])

  const handleDismiss = useCallback(() => {
    setReviewModalOpen(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
  }, [onFieldAInput, txHash])

  const resetInput = useCallback(() => {
    onFieldAInput('')
    onFieldBInput('')
  }, [onFieldAInput, onFieldBInput])

  useEffect(() => {
    if (pathname) resetInput()
  }, [resetInput, pathname])

  const [submitting, setSubmitting] = useState(false)

  const [, updateInProgressModalOpen] = useTransactionInProgressModalOpen()
  const handleConfirm = useCallback(async () => {
    setSubmitting(true)
    setReviewModalOpen(true)
    try {
      if (approvalA !== ApprovalState.APPROVED) {
        await approveACallback()
      }

      if (approvalB !== ApprovalState.APPROVED) {
        await approveBCallback()
      }

      await onAdd()
      updateInProgressModalOpen(true)
    } catch (_error) {
      console.dir(_error)
      if ((_error as any).code !== 'ACTION_REJECTED') {
        toast.error('Error adding liquidity')
      }
      updateInProgressModalOpen(false)
    } finally {
      setSubmitting(false)
      setReviewModalOpen(false)
    }
  }, [approvalA, approvalB, approveACallback, approveBCallback, onAdd, updateInProgressModalOpen])

  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false)
    resetInput()
    setTxHash('')
    navigate(goBack)
  }

  const handleCurrencyASelect = (_currencyA: Currency) => {
    navigate(`/pool/add/${currencyId(_currencyA)}/${currencyIdB}`)
  }

  const handleCurrencyBSelect = (_currencyB: Currency) => {
    navigate(`/pool/add/${currencyIdA}/${currencyId(_currencyB)}`)
  }

  const queryClient = useQueryClient()
  useIntervalTxAndHandle(txHash, {
    onFailed: () => {
      setTxHash('')
    },
    onSuccess: async () => {
      await queryClient.refetchQueries(
        {
          queryKey: ['get-all-pools'],
          exact: true,
        },
        {
          throwOnError: false,
        },
      )
      await queryClient.refetchQueries(
        {
          queryKey: ['get-my-pools'],
          exact: true,
        },
        {
          throwOnError: false,
        },
      )
      setSuccessModalOpen(true)
      setTxHash('')
      onFieldAInput('')
      onFieldBInput('')
    },
  })

  return (
    <div className={'py-4'}>
      <Link to={goBack} className={'inline-flex h-8 cursor-pointer items-center gap-2 text-sm'}>
        <PixelarticonsChevronLeft aria-hidden className={'text-xl'} />
        {'Add'}
      </Link>
      <ReviewModal
        modalOpen={reviewModalOpen}
        onDismiss={handleDismiss}
        price={price}
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        noLiquidity={noLiquidity}
        poolTokenPercentage={poolTokenPercentage}
        approvalA={approvalA}
        approvalB={approvalB}
        txHash={txHash}
        liquidityMinted={liquidityMinted}
      />
      <TransactionSuccessModal isOpen={successModalOpen} onClose={handleCloseSuccessModal} />
      <div className={'flex w-full justify-center'}>
        <div className={'px-16 py-8'}>
          <div className={'flex flex-col items-center'}>
            <div
              className={'relative flex w-full max-w-[400px] flex-col text-[#9E9E9E]'}
              style={{
                '--rhombus-bg-color': 'var(--body-bg)',
              }}
            >
              <SlippageSetting className={'self-end'} />

              <CurrencyInputPanel
                errorRhombus={false}
                label={'ADD'}
                value={formattedAmounts[Field.CURRENCY_A]}
                onUserInput={onFieldAInput}
                error={fieldAError}
                onMax={() => {
                  onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                }}
                showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                currency={currencies[Field.CURRENCY_A]}
                disableCurrencySelect={
                  currencies[Field.CURRENCY_A] &&
                  currencies[Field.CURRENCY_A] !== ETHER &&
                  currencies[Field.CURRENCY_A].symbol !== 'WETH'
                }
                onCurrencySelect={handleCurrencyASelect}
                rhombus={'top'}
                className={'mt-6'}
                customFilter={(token) => (token.symbol ? token.symbol.toUpperCase() === 'WETH' : false)}
              />
              <div
                className={
                  'absolute top-[148px] left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-md border-4 border-[#0f0f0f] bg-[#242424]'
                }
              >
                <img src={AddIcon} alt={''} aria-hidden />
              </div>
              <CurrencyInputPanel
                errorRhombus={false}
                label={'ADD'}
                error={fieldBError}
                value={formattedAmounts[Field.CURRENCY_B]}
                onUserInput={onFieldBInput}
                onMax={() => {
                  onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
                }}
                showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
                currency={currencies[Field.CURRENCY_B]}
                disableCurrencySelect={
                  currencies[Field.CURRENCY_B] &&
                  currencies[Field.CURRENCY_B] !== ETHER &&
                  currencies[Field.CURRENCY_B].symbol !== 'WETH'
                }
                onCurrencySelect={handleCurrencyBSelect}
                rhombus={'bottom'}
                className={'mt-1'}
                customFilter={(token) => (token.symbol ? token.symbol.toUpperCase() === 'WETH' : false)}
              />

              {!!currencyA && !!currencyB && (
                <div
                  style={{
                    '--rhombus-height': '4px',
                  }}
                  className={
                    'after:bottom-rhombus text-[#9E9E9E] relative mt-1 rounded-md bg-[#242424] px-6 py-4 text-xs'
                  }
                >
                  <p className={'mb-5'}>{'PRICES AND POOL SHARE'}</p>
                  <div className={'flex flex-col gap-4'}>
                    <p className={'flex justify-between'}>
                      <span>
                        {currencyA.symbol}
                        {' PER '}
                        {currencyB.symbol}
                      </span>
                      <span>
                        {pairState === PairState.LOADING ? (
                          <span className={'loading'} />
                        ) : (
                          price?.invert().toSignificant(4) ?? '-'
                        )}
                      </span>
                    </p>
                    <p className={'flex justify-between'}>
                      <span>
                        {currencyB.symbol}
                        {' PER '}
                        {currencyA.symbol}
                      </span>
                      <span>
                        {pairState === PairState.LOADING ? (
                          <span className={'loading'} />
                        ) : (
                          price?.toSignificant(4) ?? '-'
                        )}
                      </span>
                    </p>
                    <p className={'flex justify-between'}>
                      <span>{'SHARE OF POOL'}</span>
                      <span>
                        {noLiquidity ? (
                          '100'
                        ) : pairState === PairState.LOADING ? (
                          <span className={'loading'} />
                        ) : (
                          (poolTokenPercentage?.toSignificant(4) ?? '-') + '%'
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              )}
              <div className={'flex justify-center mt-8'}>
                {account ? (
                  isSupportedChainId ? (
                    <ButtonPrimary
                      onPress={handleConfirm}
                      className={'w-full max-w-60'}
                      isDisabled={!!error || !!fieldAError || !!fieldBError}
                      isLoading={submitting || pairState === PairState.LOADING}
                    >
                      {'Confirm'}
                    </ButtonPrimary>
                  ) : (
                    <SwitchChainButton />
                  )
                ) : (
                  <ConnectWalletButton />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={'w-[455px] pt-[70px]'}>
          <div className={'mb-6 text-[16px]'}>{'HOW IT WORKS'}</div>
          <p className={'text-[12px] leading-6 mb-6 [&>span]:text-lemonYellow'}>
            {
              'When you add liquidity, you will receive pool tokens representing your position. These tokens automatically'
            }
            {'earn '}
            <span>{'$PAX'}</span> {'proportional to your share of the pool, and can be redeemed at any time.'}
          </p>
          <p className={'text-[12px] leading-6 [&>span]:text-lemonYellow'}>
            {'By adding liquidity, you will earn '}
            <span>{'$PAX'}</span> {'from all trades on this pair, proportional to your'}
            {
              'share of the pool. And the 0.3% reward from the trades will be used to gift the users who provide liquidity'
            }
            {'for '}
            <span>{'$PAX'}</span>
            {'.'}
          </p>
        </div>
      </div>
    </div>
  )
}
