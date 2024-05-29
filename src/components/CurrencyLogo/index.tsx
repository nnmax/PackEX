import { Currency, ETHER, Token } from '@nnmax/uniswap-sdk-v2'
import { useMemo } from 'react'

import styled from 'styled-components'

import EthereumLogo from '../../assets/images/ethereum-logo.png'
import useHttpLocations from '../../hooks/useHttpLocations'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import Logo from '../Logo'
import clsx from 'clsx'

const getTokenLogoURL = (address: string) =>
  `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`

export default function CurrencyLogo({
  currency,
  size = '24px',
  style,
  src,
  className,
}: {
  currency?: Currency
  size?: string
  style?: React.CSSProperties
  src?: string
  className?: string
}) {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

  const srcs: string[] = useMemo(() => {
    if (currency === ETHER) return []

    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, getTokenLogoURL(currency.address)]
      }

      return [getTokenLogoURL(currency.address)]
    }
    return []
  }, [currency, uriLocations])

  if (src) {
    return <img width={size} height={size} alt={''} style={style} className={clsx(className, 'rounded-full')} />
  }

  if (currency === ETHER) {
    return (
      <img
        src={EthereumLogo}
        style={{
          width: size,
          height: size,
          ...style,
        }}
        alt={''}
        className={clsx(className, 'shadow-[0px_6px_10px_rgba(0,0,0,0.075)] rounded-full')}
      />
    )
  }

  return (
    <StyledLogo
      size={size}
      srcs={srcs}
      alt={`${currency?.symbol ?? 'token'} logo`}
      style={style}
      className={clsx(className, 'rounded-full')}
    />
  )
}
