import { useEffect, useRef } from 'react'
import useBTCWallet from '@/hooks/useBTCWallet'

export default function useDisconnectBtcOnUnmounted() {
  const { disconnect } = useBTCWallet()
  const disconnectRef = useRef(disconnect)
  disconnectRef.current = disconnect
  useEffect(() => disconnectRef.current, [])
}
