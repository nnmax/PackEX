import clsx from 'clsx'
import { escapeRegExp } from 'lodash-es'
import React, { forwardRef } from 'react'
import { TextField, Input as AriaInput, Label as AriaLabel } from 'react-aria-components'

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

interface InputProps extends Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'> {
  value: string
  onUserInput: (input: string) => void
  label: string
  error?: boolean
  fontSize?: string
  align?: 'right' | 'left'
  maxDecimals?: number
  loading?: boolean
}

function isInputGreaterThanDecimals(value: string, maxDecimals?: number): boolean {
  const decimalGroups = value.split('.')
  return !!maxDecimals && decimalGroups.length > 1 && decimalGroups[1].length > maxDecimals
}

const NumberInput = forwardRef<HTMLInputElement, InputProps>(
  ({ value, onUserInput, placeholder, maxDecimals, disabled, label, loading }: InputProps, ref) => {
    const enforcer = (nextUserInput: string) => {
      if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
        if (isInputGreaterThanDecimals(nextUserInput, maxDecimals)) {
          return
        }

        onUserInput(nextUserInput)
      }
    }

    return (
      <TextField
        ref={ref}
        value={value}
        isDisabled={disabled}
        onChange={(value) => {
          enforcer(value.replace(/,/g, '.'))
        }}
        inputMode="decimal"
        autoComplete="off"
        type="text"
        pattern="^[0-9]*[.,]?[0-9]*$"
        minLength={1}
        maxLength={79}
      >
        <AriaLabel className={'mb-2 text-xs text-[#9E9E9E] block'}>{label}</AriaLabel>
        <AriaInput
          spellCheck="false"
          autoCorrect="off"
          placeholder={placeholder || '0'}
          className={clsx(
            'w-full bg-transparent text-white outline-none reset-input-number placeholder:text-[#9e9e9e]',
            {
              'loading placeholder:text-transparent': loading,
            },
          )}
        />
      </TextField>
    )
  },
)

NumberInput.displayName = 'NumberInput'

export default React.memo(NumberInput)
