import PnL from './PnL'

interface IntroduceProsp {
  pnlVal: string | number
  totalVal: string | number
}

/**
 * @description assets card information
 * @param props
 * @returns JSX Element
 */
const Introduce: React.FC<IntroduceProsp> = (props: IntroduceProsp): JSX.Element => {
  const { pnlVal, totalVal } = props
  return (
    <div className={'mb-6 mt-6 flex items-center gap-[60px]'}>
      <dl
        className={
          'relative w-full max-w-80 rounded-md border border-[#9E9E9E] px-8 pb-6 pt-8 text-xs text-[#9E9E9E] before:rhombus-bg-[#9E9E9E] before:top-rhombus'
        }
      >
        <div aria-hidden className={'rhombus-bg-[--body-bg] -rhombus-top-px rhombus-w-[calc(50%-2px)] top-rhombus'} />
        <div>
          <dt>{'Total Value'}</dt>
          <dd className={'mt-4 text-base text-white'}>{`$ ${totalVal}`}</dd>
        </div>
        <div className={'mt-4'}>
          <dt>{"Today's PnL"}</dt>
          <dd className={'mt-4'}>
            <PnL value={Number(pnlVal)} positive />
          </dd>
        </div>
      </dl>

      <p className={'text-sm leading-7 [&>span]:text-lemonYellow'}>
        {'You can get '}
        <span>{'1:1'}</span>
        {
          ' migrated assets on blast by depositing the assets which are on other networks, and easily get the original assets back by withdrawing. PackEX will launch these assets '
        }
        <span>{'1:1'}</span> {'on blast while you deposit and burn them while you withdraw.'}
      </p>
    </div>
  )
}

export default Introduce