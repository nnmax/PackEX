import clsx from 'clsx'

export default function PnL(props: { positive?: boolean; negative?: boolean; value: number }) {
  const { positive, negative, value } = props

  return (
    <span
      className={clsx('text-xs', {
        'text-[#00B578]': positive,
        'text-[#FA5151]': negative,
      })}
    >
      {positive && '+'}
      {negative && '-'}
      {' $ '}
      {value}
    </span>
  )
}
