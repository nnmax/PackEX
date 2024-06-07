import useControlled from '@/hooks/useControlled'
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

interface ToggleButtonGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: string | null
  defaultValue?: string | null
  onChange?: (value: string | null, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

export default forwardRef<HTMLDivElement, ToggleButtonGroupProps>(function ToggleButtonGroup(props, ref) {
  const { children, onChange, value: valueProp, className, defaultValue, ...restProps } = props
  const [value, setValue] = useControlled({
    controlled: valueProp,
    defaultValue,
  })

  const handleChange = useCallback<Exclude<ToggleButtonGroupProps['onChange'], undefined>>(
    (buttonValue, event) => {
      const newValue = value === buttonValue ? null : buttonValue
      setValue(newValue)
      if (!onChange) return
      onChange(newValue, event)
    },
    [onChange, setValue, value],
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
