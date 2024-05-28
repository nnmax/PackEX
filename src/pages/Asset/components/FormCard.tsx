import { Asset } from '@/api'
import { ButtonYellow, ButtonYellowLight } from '@/components/Button'
import CurrencyLogo from '@/components/CurrencyLogo'
import Wallet from '@/components/Icons/Wallet'
import clsx from 'clsx'
import QueryString from 'qs'
import { useState } from 'react'
import { Form, Input, Label, NumberField, TextArea, TextField } from 'react-aria-components'
import { useLocation } from 'react-router-dom'

enum FormField {
  Amount = 'amount',
  Address = 'address',
}

const width = 404

const width1 = 200

const height1 = 60

const height2 = 156

export default function FormCard(props: {
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  loading?: boolean
  type: 'deposit' | 'withdraw'
  showConnectWalletButton?: boolean
  onWalletToggle?: () => void
}) {
  const { onSubmit, loading, type, showConnectWalletButton, onWalletToggle } = props

  const [amount, setAmount] = useState(NaN)

  const { search } = useLocation()
  const data = QueryString.parse(search, {
    ignoreQueryPrefix: true,
  }) as unknown as Asset

  const handleMax = () => {
    setAmount(data.availableAmount)
  }

  return (
    <Form className={'mt-[60px] flex flex-col items-center'} onSubmit={onSubmit}>
      <div className={'flex flex-col gap-1'} style={{ width }}>
        <div className={'flex gap-1 text-sm'}>
          <div
            className={clsx('flex flex-1 items-center rounded-l-md bg-[#242424] px-6 py-5')}
            style={{
              clipPath: getDeformityOne(width1, height1, 6),
              width: width1,
              height: height1,
            }}
          >
            <span className={'mr-2 text-[#9E9E9E]'}>{'Chain'}</span>
            <CurrencyLogo src={data.originNetworkLogo} className={'mr-1'} size={'20px'} />
            <span>{data.originNetworkName}</span>
          </div>
          <div
            className={clsx('flex flex-1 items-center rounded-r-md bg-[#242424] px-6 py-5')}
            style={{
              clipPath: getDeformityTwo(width1, height1, 6),
              width: width1,
              height: height1,
            }}
          >
            <span className={'mr-2 text-[#9E9E9E]'}>{'Token'}</span>
            <CurrencyLogo src={data.logoUri} className={'mr-1'} size={'20px'} />
            <span>{data.symbol}</span>
          </div>
        </div>
        <div
          className={'relative rounded-md bg-[#242424] p-6'}
          style={{ height: height2, clipPath: type === 'deposit' ? getDeformityThree(width, height2, 6) : undefined }}
        >
          <div className={'flex flex-col justify-between h-full'}>
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
        {type === 'withdraw' && (
          <div
            className={'relative rounded-md bg-[#242424] p-6'}
            style={{
              clipPath: getDeformityThree(width, height2, 6),
              height: height2,
            }}
          >
            <TextField className={'flex flex-col gap-4'} isRequired>
              <Label className={'text-[#9E9E9E]'}>{'BITCOIN ADDRESS:'}</Label>
              <div className={'flex items-center'}>
                <TextArea
                  rows={2}
                  name={FormField.Address}
                  className={
                    'text-[12px] leading-[20px] h-full w-full px-[12px] py-[8px] bg-transparent resize-none border rounded border-[#9E9E9E]'
                  }
                />
              </div>
            </TextField>
          </div>
        )}
      </div>
      {showConnectWalletButton ? (
        <ButtonYellowLight onPress={onWalletToggle} className={'text-xs w-full max-w-60 mt-14'}>
          <Wallet className={'text-xl mr-6'} />
          <span>Connect Wallet</span>
        </ButtonYellowLight>
      ) : (
        <ButtonYellow type={'submit'} isDisabled={loading} className={clsx('mt-14 w-full max-w-60')}>
          {loading ? <span aria-label="Loading" className="loading loading-dots" /> : 'Confirm'}
        </ButtonYellow>
      )}

      {type === 'deposit' && (
        <p style={{ fontFamily: 'Prompt' }} className={'w-[390px] mt-20 text-[#6F6F6F] text-[12px] leading-5'}>
          Please note that any assets may be granted any rights and interests by anyone. We cannot support the claims
          for all of them. To avoid disputes, please be aware that after the assets have been migrated, all the rights
          and interests of the native assets belongs to PACKEX.
        </p>
      )}
    </Form>
  )
}

function getDeformityOne(width: number, height: number, radius: number) {
  return `path('M ${radius},0 L ${width / 2},0 L ${width / 2 + 9},7 L ${width},7 L ${width},${height} L ${radius},${height} A ${radius} ${radius} 0 0 1 0 ${height - radius} L 0,${radius} A ${radius} ${radius} 0 0 1 ${radius} 0 Z')`
}

function getDeformityTwo(width: number, height: number, radius: number) {
  return `path('M 0,7 L ${width / 2 - 9},7 L ${width / 2},0 L ${width - radius},0 A ${radius} ${radius} 0 0 1 ${width} ${radius} L ${width},${height - radius} A ${radius} ${radius} 0 0 1 ${width - radius} ${height} L 0,${height} Z')`
}

function getDeformityThree(width: number, height: number, radius: number) {
  return `path('M ${radius},0 L ${width - radius},0 A ${radius} ${radius} 0 0 1 ${width} ${radius} L ${width} ${height - radius} A ${radius} ${radius} 0 0 1 ${width - radius} ${height} L ${(width / 4) * 3},${height} L ${(width / 4) * 3 - 7},${height - 9} L ${width / 4 + 7},${height - 9} L ${width / 4},${height} L ${radius},${height} A ${radius} ${radius} 0 0 1 0 ${height - radius} L 0,${radius} A ${radius} ${radius} 0 0 1 ${radius} 0 Z')`
}
