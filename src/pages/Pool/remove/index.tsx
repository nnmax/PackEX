import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { Button, Heading } from 'react-aria-components'
import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft'
import SlippageSetting from '@/components/SlippageSetting'
import { Field } from '@/state/burn/actions'
import { useUserDeadline, useUserSlippageTolerance } from '@/state/user/hooks'
import { ChainId, ETHER, Percent } from '@nnmax/uniswap-sdk-v2'
import { ApprovalState, useApproveCallback } from '@/hooks/useApproveCallback'
import { useCurrency } from '@/hooks/Tokens'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import { useBurnActionHandlers, useBurnState, useDerivedBurnInfo } from '@/state/burn/hooks'
import { ROUTER_ADDRESS } from '@/constants'
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '@/utils'
import useDebouncedChangeHandler from '@/utils/useDebouncedChangeHandler'
import CurrencyLogo from '@/components/CurrencyLogo'
import { ButtonPrimary, ConnectWalletButton, SwitchChainButton } from '@/components/Button'
import AriaModal from '@/components/AriaModal'
import { toast } from 'react-toastify'
import SuccessModal from '@/components/Pool/SuccessModal'
import { useAccount, useChainId, useTransactionReceipt } from 'wagmi'
import { useEthersProvider } from '@/hooks/useEthersProvider'
import useIsSupportedChainId from '@/hooks/useIsSupportedChainId'
import ToggleButtonGroup from '@/components/ToggleButtonGroup'
import ToggleButton from '@/components/ToggleButton'
import TransactionInProgressModal from '@/components/TransactionInProgressModal'
import { useMyPools } from '@/api/get-my-pools'
import { PairState } from '@/data/Reserves'

const commonButtonClasses =
  'text-[#9E9E9E] text-center leading-6 w-12 h-6 border border-[#9E9E9E] aria-pressed:border-lemonYellow transition-colors aria-pressed:text-lemonYellow'

export default function PoolRemove() {
  const history = useHistory()
  const { currencyIdA, currencyIdB } = useParams<{
    currencyIdA: string
    currencyIdB: string
  }>()
  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]
  const library = useEthersProvider()
  const { address: account } = useAccount()
  const chainId: ChainId = useChainId()
  const isSupportedChainId = useIsSupportedChainId()
  const [tokenA, tokenB] = useMemo(
    () => [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)],
    [currencyA, currencyB, chainId],
  )
  const inputId = useId()

  // burn state
  const { independentField, typedValue } = useBurnState()
  const { pair, parsedAmounts, error, pairState } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined)
  const { onUserInput: _onUserInput } = useBurnActionHandlers()
  const isValid = !error

  // modal and loading
  const [loadingModalOpen, setLoadingModalOpen] = useState(false)
  const [inProgressModalOpen, setInProgressModalOpen] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)

  const { refetch: refetchMyPools } = useMyPools()

  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
      ? '0'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
        ? '<1'
        : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? '',
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A ? typedValue : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B ? typedValue : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '',
  }

  // pair contract
  // const pairContract: Contract | null = usePairContract(pair?.liquidityToken?.address)

  // allowance handling
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback] = useApproveCallback(parsedAmounts[Field.LIQUIDITY], ROUTER_ADDRESS)

  // async function onAttemptToApprove() {
  // if (!pairContract || !pair || !library) throw new Error('missing dependencies')
  // const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
  // if (!liquidityAmount) throw new Error('missing liquidity amount')
  // try to gather a signature for permission
  // const nonce = await pairContract.nonces(account)
  // const deadlineForSignature: number = Math.ceil(Date.now() / 1000) + deadline
  // const EIP712Domain = [
  //   { name: 'name', type: 'string' },
  //   { name: 'version', type: 'string' },
  //   { name: 'chainId', type: 'uint256' },
  //   { name: 'verifyingContract', type: 'address' },
  // ]
  // const domain = {
  //   name: 'Uniswap V2',
  //   version: '1',
  //   chainId: chainId,
  //   verifyingContract: pair.liquidityToken.address,
  // }
  // const Permit = [
  //   { name: 'owner', type: 'address' },
  //   { name: 'spender', type: 'address' },
  //   { name: 'value', type: 'uint256' },
  //   { name: 'nonce', type: 'uint256' },
  //   { name: 'deadline', type: 'uint256' },
  // ]
  // const message = {
  //   owner: account,
  //   spender: ROUTER_ADDRESS,
  //   value: liquidityAmount.raw.toString(),
  //   nonce: nonce.toHexString(),
  //   deadline: deadlineForSignature,
  // }
  // const data = JSON.stringify({
  //   types: {
  //     EIP712Domain,
  //     Permit,
  //   },
  //   domain,
  //   primaryType: 'Permit',
  //   message,
  // })
  // library
  //   .send('eth_signTypedData_v4', [account, data])
  //   .then(splitSignature)
  //   .then((signature) => {
  //     setSignatureData({
  //       v: signature.v,
  //       r: signature.r,
  //       s: signature.s,
  //       deadline: deadlineForSignature,
  //     })
  //   })
  //   .catch((error) => {
  //     // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
  //     if (error?.code !== 4001) {
  //       approveCallback()
  //     }
  //   })
  // }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      setSignatureData(null)
      return _onUserInput(field, typedValue)
    },
    [_onUserInput],
  )

  async function onRemove(_approval = approval) {
    if (!chainId || !library || !account) throw new Error('missing dependencies')
    const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts
    if (!currencyAmountA || !currencyAmountB) {
      throw new Error('missing currency amounts')
    }
    const router = getRouterContract(chainId, library, account)

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0],
    }

    if (!currencyA || !currencyB) throw new Error('missing tokens')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    const currencyBIsETH = currencyB === ETHER
    const oneCurrencyIsETH = currencyA === ETHER || currencyBIsETH
    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline

    if (!tokenA || !tokenB) throw new Error('could not wrap')

    let methodNames: string[], args: Array<string | string[] | number | boolean>
    // we have approval, use normal remove liquidity
    if (_approval === ApprovalState.APPROVED) {
      // removeLiquidityETH
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          deadlineFromNow,
        ]
      }
      // removeLiquidity
      else {
        methodNames = ['removeLiquidity']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          deadlineFromNow,
        ]
      }
    }
    // we have a signataure, use permit versions of remove liquidity
    else if (signatureData !== null) {
      // removeLiquidityETHWithPermit
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETHWithPermit', 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ]
      }
      // removeLiquidityETHWithPermit
      else {
        methodNames = ['removeLiquidityWithPermit']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ]
      }
    } else {
      throw new Error('Attempting to confirm without approval or a signature. Please contact support.')
    }

    const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
      methodNames.map((methodName) =>
        router.estimateGas[methodName](...args)
          .then(calculateGasMargin)
          .catch((error) => {
            console.error(`estimateGas failed`, methodName, args, error)
            return BigNumber.from(500000)
          }),
      ),
    )

    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex((safeGasEstimate) =>
      BigNumber.isBigNumber(safeGasEstimate),
    )

    // all estimations failed...
    if (indexOfSuccessfulEstimation === -1) {
      console.error('This transaction would fail. Please contact support.')
    } else {
      const methodName = methodNames[indexOfSuccessfulEstimation]
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation]

      await router[methodName](...args, {
        gasLimit: safeGasEstimate,
      })
        .then((response: TransactionResponse) => {
          setTxHash(response.hash)
        })
        .catch((error: Error) => {
          // we only care if the error is something _other_ than the user rejected the tx
          console.error(error)
        })
    }
  }

  const liquidityPercentChangeCallback = useCallback(
    (value: number) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value.toString())
    },
    [onUserInput],
  )

  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
    liquidityPercentChangeCallback,
  )

  const handleConfirm = async () => {
    setLoadingModalOpen(true)
    try {
      console.log('%c [ approval ]-303', 'font-size:13px; background:pink; color:#bf2c9f;', approval)
      if ((approval === ApprovalState.NOT_APPROVED || approval === ApprovalState.UNKNOWN) && signatureData === null) {
        await approveCallback().catch((e) => {
          console.error(e)
        })
      }
      await onRemove(ApprovalState.APPROVED)
      setInProgressModalOpen(true)
    } catch (error) {
      console.error(error)
      toast.error('Error removing liquidity')
    } finally {
      setLoadingModalOpen(false)
    }
  }

  const { data: txReceipt } = useTransactionReceipt({
    hash: txHash as `0x${string}`,
    chainId,
    query: {
      refetchInterval: 1000,
      enabled: !!txHash,
    },
  })

  useEffect(() => {
    if (!txReceipt) return

    let unmounted = false
    const timer = setTimeout(() => {
      refetchMyPools().finally(() => {
        if (unmounted) return
        setInProgressModalOpen(false)
        setSuccessModalOpen(true)
      })
    }, 10000)

    return () => {
      unmounted = true
      clearTimeout(timer)
    }
  }, [refetchMyPools, txReceipt])

  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false)
    setSignatureData(null) // important that we clear signature data to avoid bad sigs
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '0')
    }
    setTxHash('')
    history.push('/pool/my')
  }

  return (
    <div className={'py-4'}>
      <div className={'py-4'}>
        <Button
          onPress={() => {
            history.goBack()
          }}
          className={'inline-flex h-8 items-center gap-2 text-sm'}
        >
          <PixelarticonsChevronLeft aria-hidden className={'text-xl'} />
          {'Remove'}
        </Button>
      </div>

      <AriaModal
        isOpen={loadingModalOpen}
        onOpenChange={setLoadingModalOpen}
        isKeyboardDismissDisabled
        contentClassName={'flex flex-col items-center gap-4'}
      >
        <span aria-hidden className={'loading !w-20 text-lemonYellow'} />
        <Heading slot="title">CONFIRMATION</Heading>
        <p className={'text-xs'}>CONFIRM TRANSACTION IN YOUR WALLET</p>
      </AriaModal>
      <SuccessModal isOpen={successModalOpen} onClose={handleCloseSuccessModal} />
      <TransactionInProgressModal isOpen={inProgressModalOpen} />
      <div className={'flex justify-center'}>
        <div
          className={'flex w-full justify-center relative max-w-[400px] flex-col text-[#9E9E9E] mt-9'}
          style={{
            '--rhombus-bg-color': 'var(--body-bg)',
          }}
        >
          <SlippageSetting className={'self-end mb-6'} />
          <div className={clsx('relative flex flex-col rounded-md bg-[#242424] p-6 before:top-rhombus')}>
            <form className={'flex flex-col gap-4'}>
              <label htmlFor={inputId} className={'text-[#9E9E9E] text-xs'}>
                {'YOU REMOVE'}
              </label>
              <div className={'flex flex-col gap-4'}>
                <div className={'relative h-7 w-16 rounded-sm'}>{formattedAmounts[Field.LIQUIDITY_PERCENT]}%</div>
                <div>
                  <input
                    id={inputId}
                    type={'range'}
                    className={'w-full'}
                    min={0}
                    max={100}
                    step={0.1}
                    value={innerLiquidityPercentage}
                    onChange={(event) => {
                      setInnerLiquidityPercentage(Number.parseInt(event.target.value, 10))
                    }}
                  />
                </div>
              </div>
              <ToggleButtonGroup
                className={'flex items-center justify-start text-xs gap-4'}
                onChange={(selected) => {
                  if (selected) {
                    onUserInput(Field.LIQUIDITY_PERCENT, selected)
                  } else {
                    onUserInput(Field.LIQUIDITY_PERCENT, '0')
                  }
                }}
              >
                <ToggleButton className={commonButtonClasses} value="25">
                  {'25%'}
                </ToggleButton>
                <ToggleButton className={commonButtonClasses} value="50">
                  {'50%'}
                </ToggleButton>
                <ToggleButton className={commonButtonClasses} value="75">
                  {'75%'}
                </ToggleButton>
                <ToggleButton className={commonButtonClasses} value="100">
                  {'MAX'}
                </ToggleButton>
              </ToggleButtonGroup>
            </form>
          </div>
          <div
            className={clsx('relative flex flex-col rounded-md bg-[#242424] p-6', 'mt-1', {
              'border border-[#FF2323] rhombus-bg-[#FF2323]': false,
              'after:bottom-rhombus': true,
            })}
          >
            <form className={'flex flex-col gap-4'}>
              <div className={'flex items-center text-xs'}>
                <span className={'ml-1 inline-block rounded px-2 py-1'}>{'REMOVING'}</span>
                <CurrencyLogo currency={currencyA} />
                <span className={'ml-auto text-[#9E9E9E]'}>
                  {pairState === PairState.LOADING ? (
                    <span className={'loading'} />
                  ) : (
                    formattedAmounts[Field.CURRENCY_A] || '-'
                  )}{' '}
                  {currencyA?.symbol}
                </span>
              </div>
              <div className={'flex items-center text-xs'}>
                <span className={'ml-1 inline-block rounded px-2 py-1'}>{'REMOVING'}</span>
                <CurrencyLogo currency={currencyB} />
                <span className={'ml-auto text-[#9E9E9E]'}>
                  {pairState === PairState.LOADING ? (
                    <span className={'loading'} />
                  ) : (
                    formattedAmounts[Field.CURRENCY_B] || '-'
                  )}{' '}
                  {currencyB?.symbol}
                </span>
              </div>
              <div className={'flex items-center text-xs'}>
                <span className={'ml-1 inline-block rounded px-2 py-1'}>{'RATE'}</span>
                <span className={'ml-auto text-[#9E9E9E]'}>
                  1 {currencyA?.symbol} ={' '}
                  {pairState === PairState.LOADING ? (
                    <span className={'loading'} />
                  ) : tokenA && pair ? (
                    pair.priceOf(tokenA).toSignificant(6)
                  ) : (
                    '-'
                  )}{' '}
                  {currencyB?.symbol}
                </span>
              </div>
            </form>
          </div>
          <div className={'flex justify-center mt-8'}>
            {account ? (
              isSupportedChainId ? (
                <div className={'flex flex-col gap-4 w-full'}>
                  <ButtonPrimary
                    className={'w-full max-w-60'}
                    onPress={handleConfirm}
                    isLoading={
                      pairState === PairState.LOADING || loadingModalOpen || approval === ApprovalState.UNKNOWN
                    }
                    isDisabled={!isValid}
                    isError={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
                  >
                    {error ?? 'Remove'}
                  </ButtonPrimary>
                </div>
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
  )
}
