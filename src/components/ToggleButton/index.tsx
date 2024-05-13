import { forwardRef, useContext } from 'react'
import { ToggleButtonGroupContext } from '../ToggleButtonGroup'

interface ToggleButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  value: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, value: string) => void
}

function isValueSelected(value: unknown, candidate: unknown) {
  if (candidate === undefined || value === undefined) {
    return false
  }

  return value === candidate
}

export default forwardRef<HTMLButtonElement, ToggleButtonProps>(function ToggleButton(props, ref) {
  const { children, value, onClick, ...restProps } = props
  const { onChange, value: contextValue } = useContext(ToggleButtonGroupContext)
  const selected = isValueSelected(value, contextValue)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (onClick) {
      onClick(event, value)
      if (event.defaultPrevented) {
        return
      }
    }

    if (onChange) {
      onChange(value, event)
    }
  }

  return (
    <button
      type={'button'}
      value={value}
      onClick={handleClick}
      aria-pressed={selected}
      data-toggle-button
      {...restProps}
      ref={ref}
    >
      {children}
    </button>
  )
})
