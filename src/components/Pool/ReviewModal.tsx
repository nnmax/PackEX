import Modal from '@/components/Modal'
import CurrencyLogo from '@/components/CurrencyLogo'
import DoubleCurrencyLogo from '@/components/DoubleLogo'
import Steps from '@/components/Steps'
import { ApprovalState } from '@/hooks/useApproveCallback'
import { Field } from '@/state/mint/actions'
import { Currency, CurrencyAmount, Fraction, Percent, TokenAmount } from '@nnmax/uniswap-sdk-v2'
import { useMemo } from 'react'
import { Heading } from 'react-aria-components'

export default function ReviewModal(props: {
  modalOpen: boolean
  noLiquidity?: boolean
  price?: Fraction
  currencies: { [field in Field]?: Currency }
  parsedAmounts: { [field in Field]?: CurrencyAmount }
  poolTokenPercentage?: Percent
  approvalA: ApprovalState
  approvalB: ApprovalState
  txHash: string
  onDismiss?: () => void
  liquidityMinted?: TokenAmount
}) {
  const {
    modalOpen,
    currencies,
    parsedAmounts,
    noLiquidity,
    poolTokenPercentage,
    price,
    approvalA,
    approvalB,
    txHash,
    onDismiss,
    liquidityMinted,
  } = props

  const activeStep = useMemo(() => {
    if (approvalA !== ApprovalState.APPROVED) return 0
    if (approvalB !== ApprovalState.APPROVED) return 1
    if (!txHash) return 2
    return 3
  }, [approvalA, approvalB, txHash])

  return (
    <Modal
      isOpen={modalOpen}
      onOpenChange={(open) => {
        if (!open && onDismiss) onDismiss()
      }}
      isKeyboardDismissDisabled={activeStep !== 3}
      isDismissable={activeStep === 3}
    >
      <Heading slot="title" className={'text-sm'}>
        REVIEW PAIR
      </Heading>
      <hr className={'mb-6 mt-1.5 h-px w-full border-none bg-[#6A6A6A]'} />
      <p className={'text-xs text-[#9E9E9E] mt-6 mb-4'}>YOU WILL RECEIVE</p>
      <p className={'flex justify-between'}>
        <span>{liquidityMinted?.toSignificant(6) ?? '-'}</span>
        <span>POOL TOKENS</span>
      </p>
      <p className={'text-xs text-[#9E9E9E] mt-6 mb-4'}>PAIR</p>
      <div className={'flex items-center gap-2'}>
        <DoubleCurrencyLogo
          size={20}
          margin
          currency0={currencies[Field.CURRENCY_A]}
          currency1={currencies[Field.CURRENCY_B]}
        />
        <span>
          {currencies[Field.CURRENCY_A]?.symbol} / {currencies[Field.CURRENCY_B]?.symbol}
        </span>
      </div>
      <hr className={'mb-6 mt-6 h-px w-full border-none bg-[#6A6A6A]'} />
      <div className={'flex justify-between text-xs mb-6'}>
        <p className={'text-[#9E9E9E] flex'}>
          <span>DEPOSITED</span>{' '}
          <CurrencyLogo style={{ marginLeft: '8px' }} size={'16px'} currency={currencies[Field.CURRENCY_A]} />
        </p>
        <span>
          {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} {currencies[Field.CURRENCY_A]?.symbol}
        </span>
      </div>
      <div className={'flex justify-between text-xs mb-6'}>
        <p className={'text-[#9E9E9E] flex'}>
          <span>DEPOSITED</span>{' '}
          <CurrencyLogo style={{ marginLeft: '8px' }} size={'16px'} currency={currencies[Field.CURRENCY_B]} />
        </p>
        <span>
          {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} {currencies[Field.CURRENCY_B]?.symbol}
        </span>
      </div>
      <div className={'flex justify-between text-xs mb-6'}>
        <span className={'text-[#9E9E9E]'}>RATE</span>
        <span>
          {`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(4)} ${
            currencies[Field.CURRENCY_B]?.symbol
          }`}
        </span>
      </div>
      <div className={'flex justify-between text-xs'}>
        <span className={'text-[#9E9E9E]'}>SHARE OF POOL</span>
        <span>{noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%</span>
      </div>
      <hr className={'mb-6 mt-6 h-px w-full border-none bg-[#6A6A6A]'} />
      <Steps
        activeStep={activeStep}
        steps={[
          `APPROVE ${currencies[Field.CURRENCY_A]?.symbol} SPENDING`,
          `APPROVE ${currencies[Field.CURRENCY_B]?.symbol} SPENDING `,
          'CONFIRM TRANSACTION IN WALLET',
        ]}
      />
    </Modal>
  )
}
