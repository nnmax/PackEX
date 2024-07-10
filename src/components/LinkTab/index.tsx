import clsx from 'clsx'
import { useCallback, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface LinkTabProps extends React.ComponentProps<typeof Link> {
  isSelected?: boolean
}

export default function LinkTab(props: LinkTabProps) {
  const { className, children, to, isSelected: isSelectedProp, ...restProps } = props
  const location = useLocation()

  const matchPathname = useCallback(
    (pathname: string): boolean => {
      return pathname === '/' ? location.pathname === pathname : location.pathname.startsWith(pathname)
    },
    [location.pathname],
  )

  const isSelected = useMemo(() => {
    if (isSelectedProp !== undefined) return isSelectedProp

    if (typeof to === 'string') return matchPathname(to)
    if (to.pathname) return matchPathname(to.pathname)
    return false
  }, [isSelectedProp, matchPathname, to])

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
