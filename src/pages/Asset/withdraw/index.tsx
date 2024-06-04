import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ConfirmImg from '@/assets/images/confirm.png'
import { Modal, Dialog, ModalOverlay, Button } from 'react-aria-components'
import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft'
import QueryString from 'qs'
import { Asset } from '@/api'
import withdrawToken from '@/api/withdraw-token'
import { toast } from 'react-toastify'
import FormCard from '../components/FormCard'
import { useSendTransaction } from 'wagmi'

enum FormField {
  Amount = 'amount',
  Address = 'address',
}

export default function Withdraw() {
  const [isOpen, setOpen] = useState<boolean>(false)
  const { search } = useLocation()
  const { sendTransactionAsync } = useSendTransaction()
  const [loading, setLoading] = useState<boolean>(false)

  const data = QueryString.parse(search, {
    ignoreQueryPrefix: true,
  }) as unknown as Asset

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    const formData = Object.fromEntries(new FormData(event.currentTarget)) as Record<FormField, string>
    const { contractMethod } = await withdrawToken({
      amount: Number.parseFloat(formData.amount),
      address: formData.address,
      chainId: data.chainId,
      originNetworkName: data.originNetworkName,
      tokenContract: data.tokenContract,
    }).catch((error) => {
      toast.error(error.message)
      setLoading(false)
      throw error
    })

    await sendTransactionAsync({
      chainId: contractMethod.chainId,
      to: contractMethod.destination,
      value: BigInt(contractMethod.value),
      data: contractMethod.callData,
    })
      .then(() => {
        setOpen(true)
      })
      .catch((error) => {
        console.error(error)
        toast.error(error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div className={'py-4'}>
      <Link to={'/asset'} className={'inline-flex h-8 items-center gap-2 text-sm'}>
        <PixelarticonsChevronLeft aria-hidden className={'text-xl'} />
        {'Withdraw'}
      </Link>

      <FormCard onSubmit={handleSubmit} loading={loading} type="withdraw" />

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
