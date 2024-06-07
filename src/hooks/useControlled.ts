import { useState, useRef, useCallback } from 'react'
import type { SetStateAction } from 'react'

interface UseControlledProps<T = unknown> {
  /**
   * 受控模式保存的值
   */
  controlled: T | undefined

  /**
   * 非受控模式的默认值
   */
  defaultValue: T | undefined
}

/**
 * 返回组件在受控和非受控模式下的 value state
 *
 * @example
 *  const [value, setValue] = useControlled({
 *    controlled: props.value,
 *    defaultValue: props.defaultValue,
    })
 */
const useControlled = <T>(props: UseControlledProps<T>) => {
  const { controlled, defaultValue } = props

  const { current: isControlled } = useRef(controlled !== undefined)
  const [valueState, setValue] = useState(defaultValue)
  const value = isControlled ? controlled : valueState

  const setValueIfUncontrolled = useCallback(
    (newValue: SetStateAction<T | undefined>) => {
      if (!isControlled) {
        setValue(newValue)
      }
    },
    // isControlled 在 hooks 依赖列表中被忽略，因为它不应该改变。
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return [value, setValueIfUncontrolled] as const
}

export default useControlled
