import clsx from 'clsx'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { FieldError, Form, Input, Label, NumberField, TextArea, TextField } from 'react-aria-components'
import { useAccount } from 'wagmi'
import { ButtonPrimary, ConnectWalletButton, SwitchChainButton } from '@/components/Button'
import CurrencyLogo from '@/components/CurrencyLogo'
import useBTCWallet from '@/hooks/useBTCWallet'
import useIsSupportedChainId from '@/hooks/useIsSupportedChainId'
import { useBTCWalletModalToggle } from '@/state/application/hooks'
import { FormField } from '../constant'
import type { Asset } from '@/api'

const WIDTH = 404
const WIDTH1 = 200
const HEIGHT1 = 60
const HEIGHT2 = 156
const HEIGHT3 = 96

interface FormCardProps {
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  loading?: boolean
  type: 'deposit' | 'withdraw'
  data: Record<keyof Asset, string>
  placeholder?: string
  minValue?: number
  withdrawFee?: number
  isLoadingWithdrawFee?: boolean
  runesBalance?:
    | {
        amount: string
        symbol: string
      }
    | undefined
}

interface FormCardRef {
  reset: () => void
}

export default forwardRef<FormCardRef, FormCardProps>(function FormCard(props, ref) {
  const {
    onSubmit,
    loading,
    type,
    data,
    placeholder = '0',
    minValue = 0,
    withdrawFee,
    isLoadingWithdrawFee,
    runesBalance,
  } = props
  const formRef = useRef<HTMLFormElement>(null)
  const [amount, setAmount] = useState(NaN)
  const toggleBTCWalletModal = useBTCWalletModalToggle()
  const { address: btcAddress } = useBTCWallet()
  const { address: ethAddress } = useAccount()
  const isSupportedChainId = useIsSupportedChainId()
  const maxValue = Number(runesBalance?.amount ?? 99999999)
  const amountReceived = amount ? amount - (withdrawFee ?? 0) : '-'
  const [error, setError] = useState('')
  const isAmountInvalid = error === '' ? undefined : true
  const confirmButtonDisabled = isAmountInvalid

  const handleAmountChange = (value: number) => {
    setAmount(value)
    let err: typeof error = ''
    if (Number.isNaN(value)) err = ''
    if (value < minValue) err = `Min ${minValue}`
    else if (value > maxValue) err = `Insufficient Balance`
    else err = ''
    setError(err)
  }

  const handleMax = () => {
    if (runesBalance?.amount) {
      setAmount(Number.parseFloat(runesBalance.amount))
    }
  }

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        if (formRef.current) formRef.current.reset()
        setAmount(NaN)
      },
    }),
    [],
  )

  return (
    <Form className={'mt-[60px] flex flex-col items-center'} onSubmit={onSubmit} ref={formRef}>
      <div className={'flex flex-col gap-1'} style={{ width: WIDTH }}>
        <div className={'flex gap-1 text-sm'}>
          <div
            className={clsx('flex flex-1 items-center rounded-l-md bg-[#242424] px-6 py-5')}
            style={{
              clipPath: getDeformityOne(WIDTH1, HEIGHT1, 6),
              width: WIDTH1,
              height: HEIGHT1,
            }}
          >
            <span className={'mr-2 text-[#9E9E9E]'}>{'Chain'}</span>
            <CurrencyLogo src={data.originNetworkLogo} className={'mr-1'} size={'20px'} />
            <span>{data.originNetworkName}</span>
          </div>
          <div
            className={clsx('flex flex-1 items-center rounded-r-md bg-[#242424] px-6 py-5')}
            style={{
              clipPath: getDeformityTwo(WIDTH1, HEIGHT1, 6),
              width: WIDTH1,
              height: HEIGHT1,
            }}
          >
            <span className={'mr-2 text-[#9E9E9E]'}>{'Token'}</span>
            <CurrencyLogo src={data.logoUri} className={'mr-1'} size={'20px'} />
            <span>{data.symbol}</span>
          </div>
        </div>
        <div
          className={'relative rounded-md bg-[#242424] p-6'}
          style={{ height: HEIGHT2, clipPath: type === 'deposit' ? getDeformityThree(WIDTH, HEIGHT2, 6) : undefined }}
        >
          <div className={'flex flex-col justify-between h-full'}>
            <NumberField
              isInvalid={isAmountInvalid}
              value={amount}
              name={FormField.Amount}
              minValue={0}
              formatOptions={{
                minimumFractionDigits: 0,
                maximumFractionDigits: 18,
              }}
              onChange={handleAmountChange}
              isRequired
            >
              <Label className={'text-[#9E9E9E] text-xs'}>{'Amount'}</Label>
              <div className={'flex items-center mt-1'}>
                <Input
                  className={'flex-1 bg-transparent placeholder:text-[#4F4F4F] focus:outline-none'}
                  autoFocus
                  placeholder={placeholder}
                />
                <button
                  type={'button'}
                  onClick={handleMax}
                  className={'flex h-6 w-12 items-center justify-center rounded-sm border border-white text-sm'}
                >
                  {'MAX'}
                </button>
              </div>
              <FieldError className={'text-[#FF2323] text-sm'}>
                {({ defaultChildren }) => defaultChildren || error}
              </FieldError>
            </NumberField>

            <p className={'flex items-center text-xs'}>
              <span>{'AVAILABLE'}</span>
              <span className={'ml-1 inline-block rounded bg-[#0F0F0F] px-2 py-1'}>{runesBalance?.symbol ?? '-'}</span>
              <span className={'ml-auto text-[#9E9E9E]'}>{runesBalance?.amount ?? '-'}</span>
            </p>
          </div>
        </div>
        {type === 'withdraw' && (
          <>
            <div className={'relative rounded-md bg-[#242424] p-6'}>
              <TextField className={'flex flex-col gap-4'} isRequired>
                <Label className={'text-[#9E9E9E] text-xs'}>{'BITCOIN ADDRESS:'}</Label>
                <div className={'flex items-center'}>
                  <TextArea
                    rows={2}
                    name={FormField.Address}
                    spellCheck={false}
                    className={
                      'text-[12px] leading-[20px] h-full w-full px-[12px] py-[8px] bg-transparent resize-none border rounded border-[#9E9E9E]'
                    }
                  />
                </div>
                <FieldError className={'text-[#FF2323] text-sm'} />
              </TextField>
            </div>
            <div
              className={'relative rounded-md bg-[#242424] p-6 text-xs'}
              style={{
                clipPath: getDeformityThree(WIDTH, HEIGHT3, 6),
                height: HEIGHT3,
              }}
            >
              <p className={'flex justify-between items-center mb-4'}>
                <span>{'Network fee'}</span>
                <span className={'text-[#9E9E9E]'}>
                  {isLoadingWithdrawFee ? <span className={'loading'} /> : withdrawFee ?? '-'} {'DOG'}
                </span>
              </p>
              <p className={'flex justify-between items-center'}>
                <span>{'Amount received'}</span>
                <span>
                  {amountReceived ?? '-'}
                  {' DOG'}
                </span>
              </p>
            </div>
          </>
        )}
      </div>

      {type === 'deposit' ? (
        btcAddress ? (
          <ButtonPrimary
            isLoading={loading}
            isDisabled={confirmButtonDisabled}
            type={'submit'}
            className={clsx('mt-14 w-full max-w-60')}
          >
            {'Confirm'}
          </ButtonPrimary>
        ) : (
          <ConnectWalletButton onPress={toggleBTCWalletModal} className={'mt-14'} />
        )
      ) : ethAddress ? (
        isSupportedChainId ? (
          <ButtonPrimary
            isLoading={loading}
            type={'submit'}
            isDisabled={confirmButtonDisabled}
            className={clsx('mt-14 w-full max-w-60')}
          >
            {'Confirm'}
          </ButtonPrimary>
        ) : (
          <SwitchChainButton />
        )
      ) : (
        <ConnectWalletButton className={'mt-14'} />
      )}

      {type === 'deposit' && (
        <p style={{ fontFamily: 'Prompt' }} className={'w-[390px] mt-20 text-[#6F6F6F] text-[12px] leading-5'}>
          {
            'Please note that any assets may be granted any rights and interests by anyone. We cannot support the claims'
          }
          {
            'for all of them. To avoid disputes, please be aware that after the assets have been migrated, all the rights'
          }
          {'and interests of the native assets belongs to PACKEX.'}
        </p>
      )}
    </Form>
  )
})

function getDeformityOne(width: number, height: number, radius: number) {
  return `path('M ${radius},0 L ${width / 2},0 L ${width / 2 + 9},7 L ${width},7 L ${width},${height} L ${radius},${height} A ${radius} ${radius} 0 0 1 0 ${height - radius} L 0,${radius} A ${radius} ${radius} 0 0 1 ${radius} 0 Z')`
}

function getDeformityTwo(width: number, height: number, radius: number) {
  return `path('M 0,7 L ${width / 2 - 9},7 L ${width / 2},0 L ${width - radius},0 A ${radius} ${radius} 0 0 1 ${width} ${radius} L ${width},${height - radius} A ${radius} ${radius} 0 0 1 ${width - radius} ${height} L 0,${height} Z')`
}

function getDeformityThree(width: number, height: number, radius: number) {
  return `path('M ${radius},0 L ${width - radius},0 A ${radius} ${radius} 0 0 1 ${width} ${radius} L ${width} ${height - radius} A ${radius} ${radius} 0 0 1 ${width - radius} ${height} L ${(width / 4) * 3},${height} L ${(width / 4) * 3 - 7},${height - 9} L ${width / 4 + 7},${height - 9} L ${width / 4},${height} L ${radius},${height} A ${radius} ${radius} 0 0 1 0 ${height - radius} L 0,${radius} A ${radius} ${radius} 0 0 1 ${radius} 0 Z')`
}
