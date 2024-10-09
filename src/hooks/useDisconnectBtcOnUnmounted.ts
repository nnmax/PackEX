import { useEffect, useRef } from 'react'
import useBTCWallet from '@/hooks/useBTCWallet'

export default function useDisconnectBtcOnUnmounted() {
  const { disconnect } = useBTCWallet()
  const disconnectRef = useRef(disconnect)
  // eslint-disable-next-line react-compiler/react-compiler
  disconnectRef.current = disconnect
  useEffect(() => disconnectRef.current, [])
}
