import clsx from 'clsx'

export default function PnL(props: { value: number }) {
  let positive = false
  let negative = false
  let neutral = false

  const { value } = props

  if (value > 0) {
    positive = true
  } else if (value < 0) {
    negative = true
  } else {
    neutral = true
  }

  return (
    <span
      className={clsx('text-xs', {
        'text-[#00B578]': positive,
        'text-[#FA5151]': negative,
        'text-[#9E9E9E]': neutral,
      })}
    >
      {positive && '+'}
      {negative && '-'}
      {neutral ? '-' : ` $ ${Math.abs(value)}%`}
    </span>
  )
}
