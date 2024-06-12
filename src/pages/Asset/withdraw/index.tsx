import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ConfirmImg from '@/assets/images/confirm.png'
import { Modal, Dialog, ModalOverlay, Button } from 'react-aria-components'
import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft'
import QueryString from 'qs'
import { Asset, useWithdrawFee } from '@/api'
import { toast } from 'react-toastify'
import FormCard, { type FormField } from '../components/FormCard'
import { useSendTransaction } from 'wagmi'
import { WithdrawRunesParams, useWithdrawRunes } from '@/api/withdraw-runes'
import { useWithdrawRunesConfirm } from '@/api/withdraw-runes-confirm'

const DOG_MIN_AMOUNT = 1000

export default function Withdraw() {
  const [isOpen, setOpen] = useState<boolean>(false)
  const { search } = useLocation()
  const { sendTransactionAsync, isPending: sendingTransaction } = useSendTransaction()
  const { mutateAsync: withdrawRunesAsync, isPending: withdrawingRunes } = useWithdrawRunes()
  const { data: withdrawFee, isLoading: isLoadingWithdrawFee } = useWithdrawFee({
    refetchInterval: 15000,
  })
  const { mutateAsync: withdrawRunesConfirmAsync, isPending: withdrawingRunesConfirm } = useWithdrawRunesConfirm()
  const minValue = Math.max(DOG_MIN_AMOUNT, withdrawFee?.networkFeeInDog ?? 0)

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

    const txHash = await sendTransactionAsync({
      chainId: contractMethod.chainId,
      to: contractMethod.destination,
      value: BigInt(contractMethod.value),
      data: contractMethod.callData,
    })

    await withdrawRunesConfirmAsync({
      ...params,
      txHash,
    }).catch((error) => {
      console.error(error)
    })

    setOpen(true)
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
        type="withdraw"
        minValue={minValue}
        placeholder={`Min ${minValue}`}
        withdrawFee={withdrawFee?.networkFeeInDog}
        isLoadingWithdrawFee={isLoadingWithdrawFee}
      />

      <ModalOverlay
        className={
          'fixed left-0 top-0 z-20 flex h-[--visual-viewport-height] w-screen items-start justify-center bg-black/80 data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in data-[exiting]:fade-out'
        }
        isOpen={isOpen}
      >
        <Modal
          className={
            'relative top-[192px] w-full max-w-[480px] h-[376px] rounded-md bg-[#1D252E] p-14 outline-none data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:zoom-in-75 data-[exiting]:zoom-out-75'
          }
        >
          <Dialog className={'focus-visible:outline-none'}>
            <div className="w-full">
              <div className={'flex justify-center mb-6'}>
                <img className={'w-[36px] h-[36px]'} src={ConfirmImg} alt="confirm" />
              </div>
              <div className={'text-[18px] text-center'}>{'Request Submitted'}</div>
              <p className={'pt-6 text-[12px] leading-5'}>
                Your withdrawal request has been received, you will receive the equivalent amount of the original tokens
                in 24 hours, please be patient.
              </p>
              <div className={'flex justify-center mt-10'}>
                <Button
                  type={'button'}
                  onPress={() => {
                    setOpen(false)
                  }}
                  className={
                    'flex h-9 w-[160px] items-center justify-center rounded border border-lemonYellow text-xs text-[#020202] bg-[#FFC300]'
                  }
                >
                  {'OK'}
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  )
}
