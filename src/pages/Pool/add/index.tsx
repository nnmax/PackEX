import { useHistory, useParams } from 'react-router-dom'
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft'
import CurrencyInputPanel from '@/components/CurrencyInputPanel'
import { Button } from 'react-aria-components'
import AddIcon from '@/assets/images/add.png'
import SlippageSetting from '@/components/SlippageSetting'
import { Field } from '@/state/mint/actions'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '@/state/mint/hooks'
import { useWalletModalToggle } from '@/state/application/hooks'
import { useActiveWeb3React } from '@/hooks'
import { useCurrency } from '@/hooks/Tokens'
import { ETHER, TokenAmount } from '@nnmax/uniswap-sdk-v2'
import { useUserDeadline, useUserSlippageTolerance } from '@/state/user/hooks'
import { useCallback, useState } from 'react'
import { maxAmountSpend } from '@/utils/maxAmountSpend'
import { ApprovalState, useApproveCallback } from '@/hooks/useApproveCallback'
import { useTransactionAdder } from '@/state/transactions/hooks'
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '@/utils'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import { ROUTER_ADDRESS } from '@/constants'
import { ButtonYellow, ButtonYellowLight } from '@/components/Button'
import Wallet from '@/components/Icons/Wallet'
import { toast } from 'react-toastify'
import { isString } from 'lodash-es'
import ReviewModal from '@/components/Pool/ReviewModal'

export default function PoolAdd() {
  const history = useHistory()
  const { currencyIdA, currencyIdB } = useParams<{
    currencyIdA: string
    currencyIdB: string
  }>()
  const { account, chainId, library } = useActiveWeb3React()

  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected

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
    error,
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)
  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)

  const isValid = !error

  const [modalOpen, setModalOpen] = useState(true)

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

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_A], ROUTER_ADDRESS)
  const [approvalB, approveBCallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_B], ROUTER_ADDRESS)

  const addTransaction = useTransactionAdder()

  const onAdd = useCallback(async () => {
    if (!chainId || !library || !account) return
    const router = getRouterContract(chainId, library, account)

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
      args: Array<string | string[] | number>,
      value: BigNumber | null
    if (currencyA === ETHER || currencyB === ETHER) {
      const tokenBIsETH = currencyB === ETHER
      estimate = router.estimateGas.addLiquidityETH
      method = router.addLiquidityETH
      args = [
        wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address ?? '', // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
        amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(), // token min
        amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(), // eth min
        account,
        deadlineFromNow,
      ]
      value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString())
    } else {
      estimate = router.estimateGas.addLiquidity
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
      .then((estimatedGasLimit) =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit),
        }).then((response) => {
          addTransaction(response, {
            summary:
              'Add ' +
              parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
              ' ' +
              currencies[Field.CURRENCY_A]?.symbol +
              ' and ' +
              parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
              ' ' +
              currencies[Field.CURRENCY_B]?.symbol,
          })

          setTxHash(response.hash)
        }),
      )
      .catch((error) => {
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error)
        }
        throw error
      })
  }, [
    account,
    addTransaction,
    allowedSlippage,
    chainId,
    currencies,
    currencyA,
    currencyB,
    deadline,
    library,
    noLiquidity,
    parsedAmounts,
  ])

  const handleDismiss = useCallback(() => {
    setModalOpen(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
  }, [onFieldAInput, txHash])

  const handleConfirm = useCallback(async () => {
    try {
      if (approvalA !== ApprovalState.APPROVED) {
        await approveACallback()
      }

      if (approvalB !== ApprovalState.APPROVED) {
        await approveBCallback()
      }

      await onAdd()
      toast.success('Transaction submitted')
    } catch (error) {
      console.error(error)
      toast.error(isString(error) ? error : (error as any).message ?? 'An unknown error occurred. Please try again.')
    }
  }, [approvalA, approvalB, approveACallback, approveBCallback, onAdd])

  return (
    <div className={'py-4'}>
      <Button
        onPress={() => {
          history.goBack()
        }}
        className={'inline-flex h-8 cursor-pointer items-center gap-2 text-sm'}
      >
        <PixelarticonsChevronLeft aria-hidden className={'text-xl'} />
        {'Add'}
      </Button>
      <ReviewModal
        modalOpen={modalOpen}
        onDismiss={handleDismiss}
        price={price}
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        noLiquidity={noLiquidity}
        poolTokenPercentage={poolTokenPercentage}
        approvalA={approvalA}
        approvalB={approvalB}
        txHash={txHash}
      />
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
                label={'ADD'}
                value={formattedAmounts[Field.CURRENCY_A]}
                onUserInput={onFieldAInput}
                onMax={() => {
                  onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                }}
                showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                currency={currencies[Field.CURRENCY_A]}
                disableCurrencySelect
                rhombus={'top'}
                className={'mt-6'}
              />
              <div
                className={
                  'absolute top-[148px] left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-md border-4 border-[#0f0f0f] bg-[#242424]'
                }
              >
                <img src={AddIcon} alt="" aria-hidden />
              </div>
              <CurrencyInputPanel
                label={'ADD'}
                value={formattedAmounts[Field.CURRENCY_B]}
                onUserInput={onFieldBInput}
                onMax={() => {
                  onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
                }}
                showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
                currency={currencies[Field.CURRENCY_B]}
                disableCurrencySelect
                rhombus={'bottom'}
                className={'mt-1'}
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
                  <p className={'mb-5'}>PRICES AND POOL SHARE</p>
                  <div className={'flex flex-col gap-4'}>
                    <p className={'flex justify-between'}>
                      <span>
                        {currencyA.symbol} PER {currencyB.symbol}
                      </span>
                      <span>{price?.invert().toSignificant(4) ?? '-'}</span>
                    </p>
                    <p className={'flex justify-between'}>
                      <span>
                        {currencyB.symbol} PER {currencyA.symbol}
                      </span>
                      <span>{price?.toSignificant(4) ?? '-'}</span>
                    </p>
                    <p className={'flex justify-between'}>
                      <span>SHARE OF POOL</span>
                      <span>{noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%</span>
                    </p>
                  </div>
                </div>
              )}
              <div className={'flex justify-center mt-8'}>
                {account ? (
                  isValid ? (
                    <ButtonYellow onPress={handleConfirm} className={'w-full max-w-[240px]'}>
                      {'Confirm'}
                    </ButtonYellow>
                  ) : (
                    <ButtonYellowLight className={'w-full max-w-[240px]'} isDisabled>
                      {'Confirm'}
                    </ButtonYellowLight>
                  )
                ) : (
                  <ButtonYellowLight onPress={toggleWalletModal} className={'w-full max-w-[240px]'}>
                    <Wallet className={'text-xl mr-6'} />
                    <span>Connect Wallet</span>
                  </ButtonYellowLight>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={'w-[455px] pt-[70px]'}>
          <div className={'mb-6 text-[16px]'}>HOW IT WORKS</div>
          <p className={'text-[12px] leading-6 mb-6 [&>span]:text-lemonYellow'}>
            When you add liquidity, you will receive pool tokens representing your position. These tokens automatically
            earn <span>{'$PAX'}</span> proportional to your share of the pool, and can be redeemed at any time.
          </p>
          <p className={'text-[12px] leading-6 [&>span]:text-lemonYellow'}>
            By adding liquidity, you will earn <span>{'$PAX'}</span> from all trades on this pair, proportional to your
            share of the pool. And the 0.3% reward from the trades will be used to gift the users who provide liquidity
            for <span>{'$PAX'}</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
