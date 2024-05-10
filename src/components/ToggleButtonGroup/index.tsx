import { createContext, forwardRef, useCallback, useMemo } from 'react'

interface ToggleButtonGroupContextType {
  onChange: ToggleButtonGroupProps['onChange']
  value: ToggleButtonGroupProps['value']
}

export const ToggleButtonGroupContext = createContext<ToggleButtonGroupContextType>({
  value: null,
  onChange: () => {},
})

if (process.env.NODE_ENV !== 'production') {
  ToggleButtonGroupContext.displayName = 'ToggleButtonGroupContext'
}

interface ToggleButtonGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string | null
  onChange?: (value: string | null, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

export default forwardRef<HTMLDivElement, ToggleButtonGroupProps>(function ToggleButtonGroup(props, ref) {
  const { children, onChange, value, className, ...restProps } = props

  const handleChange = useCallback<Exclude<ToggleButtonGroupProps['onChange'], undefined>>(
    (buttonValue, event) => {
      if (!onChange) return

      onChange(value === buttonValue ? null : buttonValue, event)
    },
    [onChange, value],
  )

  const contextValue = useMemo(() => {
    return {
      onChange: handleChange,
      value,
    }
  }, [handleChange, value])

  return (
    <div role={'group'} className={className} {...restProps} ref={ref}>
      <ToggleButtonGroupContext.Provider value={contextValue}>{children}</ToggleButtonGroupContext.Provider>
    </div>
  )
})
