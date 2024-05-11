import { useHistory } from 'react-router-dom'
import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft'

export default function PoolAdd() {
  const history = useHistory()

  const goBack = () => {
    history.goBack()
  }

  return (
    <div className={'py-4'}>
      <span onClick={goBack} className={'inline-flex h-8 cursor-pointer items-center gap-2 text-sm'}>
        <PixelarticonsChevronLeft aria-hidden className={'text-xl'} />
        {'Add'}
      </span>
      {/* TODO a component */}
      <div className={'w-[455px]'}>
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
  )
}
