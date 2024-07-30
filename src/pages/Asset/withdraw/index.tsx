import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Heading } from 'react-aria-components'
import QueryString from 'qs'
import { toast } from 'react-toastify'
import { useSendTransaction } from 'wagmi'
import { EstimateGasExecutionError } from 'viem'
import { useWithdrawRunes } from '@/api/withdraw-runes'
import { useWithdrawRunesConfirm } from '@/api/withdraw-runes-confirm'
import useDocumentTitle from '@/hooks/useDocumentTitle'
import { useWithdrawFee } from '@/api'
import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft'
import ConfirmImg from '@/assets/images/confirm.png'
import { DEFAULT_GAS } from '@/constants'
import Modal from '@/components/Modal'
import FormCard from '../components/FormCard'
import { type FormField } from '../constant'
import type { WithdrawRunesParams } from '@/api/withdraw-runes'
import type { Asset } from '@/api'

const DOG_MIN_AMOUNT = 1000

export default function Withdraw() {
  useDocumentTitle('Withdraw')
  const [isOpen, setOpen] = useState(false)
  const { search } = useLocation()
  const { sendTransactionAsync, isPending: sendingTransaction } = useSendTransaction()
  const { mutateAsync: withdrawRunesAsync, isPending: withdrawingRunes } = useWithdrawRunes()
  const { data: withdrawFee, isLoading: isLoadingWithdrawFee } = useWithdrawFee({
    refetchInterval: 15000,
  })
  const { mutateAsync: withdrawRunesConfirmAsync, isPending: withdrawingRunesConfirm } = useWithdrawRunesConfirm()
  const minValue = Math.max(DOG_MIN_AMOUNT, withdrawFee?.networkFeeInDog ?? 0)
  const navigate = useNavigate()
  const data = QueryString.parse(search, {
    ignoreQueryPrefix: true,
  }) as unknown as Record<keyof Asset, string>

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!withdrawFee?.networkFeeInDog) {
      toast.error('Please wait for the network fee to be calculated')
      return
    }
    const formData = Object.fromEntries(new FormData(event.currentTarget)) as Record<FormField, string>
    const amount = Number.parseFloat(formData.amount)
    const amountReceived = amount - withdrawFee.networkFeeInDog
    if (amount < minValue) {
      toast.error(`Minimum withdrawal amount is ${minValue}`)
      return
    }
    const params: WithdrawRunesParams = {
      amount: Number.parseFloat(formData.amount),
      btcAddress: formData.address,
      chainId: Number(data.chainId),
      originNetworkName: data.originNetworkName,
      tokenContract: data.tokenContract,
      amountNetworkFee: withdrawFee.networkFeeInDog,
      amountReceived: amountReceived,
    }
    const { contractMethod } = await withdrawRunesAsync(params)
    const txParams = {
      chainId: contractMethod.chainId,
      to: contractMethod.destination,
      value: BigInt(contractMethod.value),
      data: contractMethod.callData,
    }
    const txHash = await sendTransactionAsync(txParams).catch((e) => {
      if (e instanceof EstimateGasExecutionError) {
        return sendTransactionAsync({
          ...txParams,
          gas: DEFAULT_GAS,
        })
      }
      throw e
    })

    await withdrawRunesConfirmAsync({
      ...params,
      txHash,
    }).catch((error) => {
      console.error(error)
    })

    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    navigate('/asset')
  }

  return (
    <div className={'py-4'}>
      <Link to={'/asset'} className={'inline-flex h-8 items-center gap-2 text-sm'}>
        <PixelarticonsChevronLeft aria-hidden className={'text-xl'} />
        {'Withdraw'}
      </Link>

      <FormCard
        data={data}
        onSubmit={handleSubmit}
        loading={withdrawingRunes || sendingTransaction || withdrawingRunesConfirm}
        type={'withdraw'}
        minValue={minValue}
        placeholder={`Min ${minValue}`}
        withdrawFee={withdrawFee?.networkFeeInDog}
        isLoadingWithdrawFee={isLoadingWithdrawFee}
        runesBalance={{
          amount: data.availableAmount,
          symbol: data.symbol,
        }}
      />

      <Modal
        contentClassName={'w-full px-10'}
        isOpen={isOpen}
        onClose={handleClose}
        showCloseButton={false}
        showRhombus={false}
        isDismissable={false}
      >
        <div className={'flex justify-center mb-6'}>
          <img className={'w-[36px] h-[36px]'} src={ConfirmImg} alt={'confirm'} />
        </div>
        <Heading slot={'title'} className={'text-[18px] text-center'}>
          {'Request Submitted'}
        </Heading>
        <p className={'pt-6 text-[12px] leading-5'}>
          {
            'Your withdrawal request has been received, you will receive the equivalent amount of the original tokens in 24'
          }
          {'hours, please be patient.'}
        </p>
        <div className={'flex justify-center mt-10'}>
          <Button
            type={'button'}
            onPress={handleClose}
            className={
              'flex h-9 w-[160px] items-center justify-center rounded border border-lemonYellow text-xs text-[#020202] bg-[#FFC300]'
            }
          >
            {'OK'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
