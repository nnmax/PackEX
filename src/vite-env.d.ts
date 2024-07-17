/// <reference types="vite/client" />

interface Window {
  ethereum?: {
    autoRefreshOnNetworkChange?: boolean
    isMetaMask?: true
    on?: (...args: any[]) => void
    removeListener?: (...args: any[]) => void
  }
}

declare module 'content-hash' {
  declare function decode(x: string): string
  declare function getCodec(x: string): string
}

declare module 'multihashes' {
  declare function decode(buff: Uint8Array): { code: number; name: string; length: number; digest: Uint8Array }
  declare function toB58String(hash: Uint8Array): string
}

declare module 'csstype' {
  type Properties = Record<`--${string}`, string | number>
}
