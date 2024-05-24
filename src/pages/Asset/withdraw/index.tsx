import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import ConfirmImg from '@/assets/images/confirm.png'
import {
  Modal,
  Dialog,
  ModalOverlay,
  Button,
  NumberField,
  Label,
  Input,
  Form,
  TextField,
  TextArea,
} from 'react-aria-components'
import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft'
import { ButtonYellow } from '@/components/Button'
import QueryString from 'qs'
import { Asset } from '@/api'
import CurrencyLogo from '@/components/CurrencyLogo'
import withdrawToken from '@/api/withdraw-token'
import { useActiveWeb3React } from '@/hooks'
import { toast } from 'react-toastify'

function getDeformityOne(width: number, height: number, radius: number) {
  return `path('M ${radius},0 L ${width / 2},0 L ${width / 2 + 9},7 L ${width},7 L ${width},${height} L ${radius},${height} A ${radius} ${radius} 0 0 1 0 ${height - radius} L 0,${radius} A ${radius} ${radius} 0 0 1 ${radius} 0 Z')`
}

function getDeformityTwo(width: number, height: number, radius: number) {
  return `path('M 0,7 L ${width / 2 - 9},7 L ${width / 2},0 L ${width - radius},0 A ${radius} ${radius} 0 0 1 ${width} ${radius} L ${width},${height - radius} A ${radius} ${radius} 0 0 1 ${width - radius} ${height} L 0,${height} Z')`
}

function getDeformityThree(width: number, height: number, radius: number) {
  return `path('M ${radius},0 L ${width - radius},0 A ${radius} ${radius} 0 0 1 ${width} ${radius} L ${width} ${height - radius} A ${radius} ${radius} 0 0 1 ${width - radius} ${height} L ${(width / 4) * 3},${height} L ${(width / 4) * 3 - 7},${height - 9} L ${width / 4 + 7},${height - 9} L ${width / 4},${height} L ${radius},${height} A ${radius} ${radius} 0 0 1 0 ${height - radius} L 0,${radius} A ${radius} ${radius} 0 0 1 ${radius} 0 Z')`
}

enum FormField {
  Amount = 'amount',
  Address = 'address',
}

export default function Withdraw() {
  const [isOpen, setOpen] = useState<boolean>(false)
  const { search } = useLocation()
  const [amount, setAmount] = useState<number>(0)
  const { library } = useActiveWeb3React()
  const [loading, setLoading] = useState<boolean>(false)

  const data = QueryString.parse(search, {
    ignoreQueryPrefix: true,
  }) as unknown as Asset

  const handleMax = () => {
    setAmount(data.availableAmount)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!library) throw new Error('Library is not ready')
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

    await library
      .getSigner()
      .sendTransaction({
        chainId: contractMethod.chainId,
        to: contractMethod.destination,
        value: contractMethod.value,
        data: contractMethod.callData,
      })
      .then((tx) => {
        console.log('Submitted a transaction:', tx)
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

      <Form className={'mt-[60px] flex flex-col items-center'} onSubmit={handleSubmit}>
        <div className={'flex w-[404px] flex-col gap-1'}>
          <div className={'flex gap-1 text-sm'}>
            <div
              className={clsx('flex h-[60px] flex-1 items-center rounded-l-md bg-[#242424] px-6 py-5')}
              style={{
                clipPath: getDeformityOne(200, 60, 6),
              }}
            >
              <span className={'mr-2 text-[#9E9E9E]'}>{'Chain'}</span>
              <CurrencyLogo src={data.originNetworkLogo} className={'mr-1'} size={'20px'} />
              <span>{data.originNetworkName}</span>
            </div>
            <div
              className={clsx('flex flex-1 items-center rounded-r-md bg-[#242424] px-6 py-5')}
              style={{
                clipPath: getDeformityTwo(200, 60, 6),
              }}
            >
              <span className={'mr-2 text-[#9E9E9E]'}>{'Token'}</span>
              <CurrencyLogo src={data.logoUri} className={'mr-1'} size={'20px'} />
              <span>{data.symbol}</span>
            </div>
          </div>
          <div className={'relative rounded-md bg-[#242424] p-6'}>
            <div className={'flex flex-col gap-4'}>
              <NumberField
                value={amount}
                name={FormField.Amount}
                maxValue={data.availableAmount}
                minValue={0}
                onChange={setAmount}
                isRequired
              >
                <Label className={'text-[#9E9E9E]'}>{'Amount'}</Label>
                <div className="flex items-center">
                  <Input className={'flex-1 bg-transparent focus:outline-none'} autoFocus />
                  <button
                    type="button"
                    onClick={handleMax}
                    className={'flex h-6 w-12 items-center justify-center rounded-sm border border-white text-sm'}
                  >
                    {'MAX'}
                  </button>
                </div>
              </NumberField>

              <p className={'flex items-center text-xs'}>
                <span>{'AVAILABLE'}</span>
                <span className={'ml-1 inline-block rounded bg-[#0F0F0F] px-2 py-1'}>{data.symbol}</span>
                <span className={'ml-auto text-[#9E9E9E]'}>{data.availableAmount}</span>
              </p>
            </div>
          </div>
          <div
            className={'relative rounded-md bg-[#242424] p-6'}
            style={{
              clipPath: getDeformityThree(404, 184, 6),
            }}
          >
            <TextField className={'flex flex-col gap-4'} isRequired>
              <Label className={'text-[#9E9E9E]'}>{'BITCOIN ADDRESS:'}</Label>
              <div className={'flex items-center'}>
                <TextArea
                  rows={2}
                  name={FormField.Address}
                  className={
                    'text-[12px] leading-[20px] h-[64px] w-full px-[12px] py-[8px] bg-transparent resize-none border rounded border-[#9E9E9E]'
                  }
                />
              </div>
            </TextField>
          </div>
        </div>
        <ButtonYellow type={'submit'} isDisabled={loading} className={clsx('mt-14 w-full max-w-60')}>
          {loading ? <span aria-label="Loading" className="loading loading-dots" /> : 'Confirm'}
        </ButtonYellow>
      </Form>

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
