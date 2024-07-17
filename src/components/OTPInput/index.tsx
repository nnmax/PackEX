import { Group } from 'react-aria-components'
import { useCallback, useEffect, useRef, useState, forwardRef } from 'react'
import { Input } from 'react-aria-components'
import clsx from 'clsx'
import useForkRef from '@/hooks/useForkRef'
import type { ChangeEventHandler, KeyboardEventHandler } from 'react'
import type { GroupProps, InputProps } from 'react-aria-components'

export interface OTPRef {
  focus: VoidFunction
  blur: VoidFunction
  nativeElement: HTMLDivElement
}

export interface OTPProps extends Omit<GroupProps, 'onChange'> {
  length?: number
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  formatter?: (value: string) => string
  disabled?: boolean
  inputClassName?: string
  loading?: boolean
}

function strToArr(str: string) {
  return (str || '').split('')
}

export default function OTP(props: OTPProps) {
  const {
    length = 6,
    defaultValue,
    value,
    onChange,
    formatter,
    disabled,
    autoFocus,
    inputClassName,
    loading,
    ...restProps
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const refs = useRef<Record<number, HTMLInputElement | null>>({})
  const internalFormatter = useCallback((txt: string) => (formatter ? formatter(txt) : txt), [formatter])
  const [valueCells, setValueCells] = useState<string[]>(strToArr(internalFormatter(defaultValue || '')))

  useEffect(() => {
    if (value !== undefined) {
      setValueCells(strToArr(value))
    }
  }, [value])

  const triggerValueCellsChange = useCallback(
    (nextValueCells: string[]) => {
      setValueCells(nextValueCells)

      // Trigger if all cells are filled
      if (
        onChange &&
        nextValueCells.length === length &&
        nextValueCells.every((c) => c) &&
        nextValueCells.some((c, index) => valueCells[index] !== c)
      ) {
        onChange(nextValueCells.join(''))
      }
    },
    [length, onChange, valueCells],
  )

  const patchValue = useCallback(
    (index: number, txt: string) => {
      let nextCells = [...valueCells]

      // Fill cells till index
      for (let i = 0; i < index; i += 1) {
        if (!nextCells[i]) {
          nextCells[i] = ''
        }
      }

      if (txt.length <= 1) {
        nextCells[index] = txt
      } else {
        nextCells = nextCells.slice(0, index).concat(strToArr(txt))
      }
      nextCells = nextCells.slice(0, length)

      // Clean the last empty cell
      for (let i = nextCells.length - 1; i >= 0; i -= 1) {
        if (nextCells[i]) {
          break
        }
        nextCells.pop()
      }

      // Format if needed
      const formattedValue = internalFormatter(nextCells.map((c) => c || ' ').join(''))
      nextCells = strToArr(formattedValue).map((c, i) => {
        if (c === ' ' && !nextCells[i]) {
          return nextCells[i]
        }
        return c
      })

      return nextCells
    },
    [internalFormatter, length, valueCells],
  )

  // ======================== Change ========================
  const onInputChange: OTPInputProps['onChange'] = (index, txt) => {
    const nextCells = patchValue(index, txt)

    const nextIndex = Math.min(index + txt.length, length - 1)
    if (nextIndex !== index) {
      refs.current[nextIndex]?.focus()
    }

    triggerValueCellsChange(nextCells)
  }

  const onInputActiveChange: OTPInputProps['onActiveChange'] = (nextIndex) => {
    refs.current[nextIndex]?.focus()
  }

  return (
    <Group {...restProps} ref={containerRef}>
      {Array.from({ length }).map((_, index) => {
        const key = `otp-${index}`
        const singleValue = valueCells[index] || ''
        return (
          <OTPInput
            ref={(inputEle) => {
              refs.current[index] = inputEle
            }}
            key={key}
            index={index}
            size={1}
            onChange={onInputChange}
            value={singleValue}
            onActiveChange={onInputActiveChange}
            autoFocus={index === 0 && autoFocus}
            disabled={disabled}
            className={clsx(inputClassName, {
              loading,
            })}
          />
        )
      })}
    </Group>
  )
}

interface OTPInputProps extends Omit<InputProps, 'onChange'> {
  index: number
  onChange: (index: number, value: string) => void
  /** Tell parent to do active offset */
  onActiveChange: (nextIndex: number) => void
}

const OTPInput = forwardRef<HTMLInputElement, OTPInputProps>(function OTPInput(props, ref) {
  const { value, onChange, onActiveChange, index, ...restProps } = props

  const onInternalChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange(index, e.target.value)
  }

  // ========================== Ref ===========================
  const inputRef = useRef<HTMLInputElement>(null)
  const handleRef = useForkRef(ref, inputRef)

  // ========================= Focus ==========================
  const syncSelection = () => {
    window.requestAnimationFrame(() => {
      const inputEle = inputRef.current
      if (document.activeElement === inputEle && inputEle) {
        inputEle.select()
      }
    })
  }

  // ======================== Keyboard ========================
  const onInternalKeyDown: KeyboardEventHandler<HTMLInputElement> = ({ key }) => {
    if (key === 'ArrowLeft') {
      onActiveChange(index - 1)
    } else if (key === 'ArrowRight') {
      onActiveChange(index + 1)
    }

    syncSelection()
  }

  const onInternalKeyUp: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Backspace' && !value) {
      onActiveChange(index - 1)
    }

    syncSelection()
  }

  // ========================= Render =========================
  return (
    <Input
      {...restProps}
      ref={handleRef}
      value={value}
      onInput={onInternalChange}
      onFocus={syncSelection}
      onKeyDown={onInternalKeyDown}
      onKeyUp={onInternalKeyUp}
      onMouseDown={syncSelection}
      onMouseUp={syncSelection}
      type={'text'}
    />
  )
})
