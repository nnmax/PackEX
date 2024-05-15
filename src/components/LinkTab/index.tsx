import clsx from 'clsx'
import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface LinkTabProps extends React.ComponentProps<typeof Link> {
  isSelected?: boolean
}

export default function LinkTab(props: LinkTabProps) {
  const { className, children, to, isSelected: isSelectedProp, ...restProps } = props
  const location = useLocation()

  const isSelected = useMemo(() => {
    if (isSelectedProp !== undefined) return isSelectedProp

    const run = (val: typeof to): boolean => {
      if (typeof val === 'string') {
        return location.pathname.startsWith(val)
      }
      if (typeof val === 'function') {
        const res = val(location)
        return run(res)
      }
      if (val.pathname) {
        return location.pathname.startsWith(val.pathname)
      }
      return false
    }

    return run(to)
  }, [isSelectedProp, location, to])

  return (
    <Link
      role={'tab'}
      to={to}
      aria-selected={isSelected}
      aria-current={isSelected ? 'page' : undefined}
      className={clsx('relative', className, {
        'before:absolute before:left-1/2 before:top-full before:h-1.5 before:w-9 before:-translate-x-1/2 before:-translate-y-[4px] before:rounded-md before:bg-lemonYellow before:content-[""]':
          isSelected,
      })}
      {...restProps}
    >
      {children}
    </Link>
  )
}
