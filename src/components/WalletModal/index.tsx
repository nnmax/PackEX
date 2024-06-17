import { useState, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import {
  useBTCWalletModalOpen,
  useBTCWalletModalToggle,
  useWalletModalOpen,
  useWalletModalToggle,
} from '../../state/application/hooks'
import { CURRENT_BTC_WALLET, MESSAGE_KEY, SIGNATURE_KEY } from '../../constants'
import { ConnectWalletData, GetUserData, connectBTCWallet, connectWallet } from '@/api'
import okxLogo from '../../assets/images/okx.svg'
import unisatLogo from '../../assets/images/unisat.svg'
import useBTCWallet, { BTCWallet } from '@/hooks/useBTCWallet'
import { isString } from 'lodash-es'
import AriaModal from '@/components/AriaModal'
import { Heading } from 'react-aria-components'
import { Connector, ConnectorAlreadyConnectedError, useChainId, useConnect, useSignMessage } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'

export default function WalletModal() {
  const [pendingWallet, setPendingWallet] = useState<Connector>()
  const queryClient = useQueryClient()
  const walletModalOpen = useWalletModalOpen()
  const toggleWalletModal = useWalletModalToggle()
  const { connectAsync } = useConnect()
  const chainId = useChainId()
  const { signMessageAsync } = useSignMessage()

  const updateUserInfo = (data: ConnectWalletData) => {
    queryClient.setQueryData<GetUserData | undefined>(['get-current-login-user'], data)
  }

  const tryActivation = async (connector: Connector) => {
    setPendingWallet(connector) // set wallet for pending view

    try {
      const { accounts } = await connectAsync({
        connector,
        chainId,
      })

      const s = window.localStorage.getItem(SIGNATURE_KEY)
      const m = window.localStorage.getItem(MESSAGE_KEY)

      let connectWalletResponse: string | ConnectWalletData | false = false
      if (m && s) {
        connectWalletResponse = await connectWallet({
          address: accounts[0],
          signature: s,
          message: m,
        }).catch((err) => {
          console.error(err)
          return false
        })
      }
      if (connectWalletResponse === false) {
        connectWalletResponse = await connectWallet({
          address: accounts[0],
        })
      }

      if (typeof connectWalletResponse === 'string') {
        const signature = await signMessageAsync({
          message: connectWalletResponse,
          account: accounts[0],
        })
        const connectWalletResponse2 = await connectWallet({
          address: accounts[0],
          signature: signature,
          message: connectWalletResponse,
        })
        if (typeof connectWalletResponse2 === 'string') {
          setPendingWallet(undefined)
          return
        }
        window.localStorage.setItem(SIGNATURE_KEY, signature)
        window.localStorage.setItem(MESSAGE_KEY, connectWalletResponse)
        updateUserInfo(connectWalletResponse2)
      } else {
        updateUserInfo(connectWalletResponse)
      }
      setPendingWallet(undefined)
      toggleWalletModal()
    } catch (error) {
      console.error(error)
      if (error instanceof ConnectorAlreadyConnectedError) {
        toggleWalletModal()
      }
      setPendingWallet(undefined)
    }
  }

  const connectors = useOrderedConnections()

  return (
    <WalletModalWrapper open={walletModalOpen} onClose={() => toggleWalletModal()}>
      {connectors.map((connector) => {
        return (
          <WalletModalListItem
            key={connector.uid}
            name={connector.name}
            icon={connector.icon!}
            loading={connector === pendingWallet}
            disabled={!!pendingWallet}
            onClick={() => {
              tryActivation(connector)
            }}
          />
        )
      })}
    </WalletModalWrapper>
  )
}

export function BTCWalletModal() {
  const walletModalOpen = useBTCWalletModalOpen()
  const toggleWalletModal = useBTCWalletModalToggle()
  const { connect, switchNetwork, signMessage, disconnect } = useBTCWallet()
  const [loadingWallet, setLoadingWallet] = useState<BTCWallet>()

  const handleClick = async (wallet: BTCWallet) => {
    setLoadingWallet(wallet)
    try {
      const { address, network, publicKey } = await connect(wallet)

      if (process.env.REACT_APP_APP_ENV === 'prod' && network !== 'livenet') {
        await switchNetwork(wallet, 'livenet')
      } else if (process.env.REACT_APP_APP_ENV === 'dev' && network !== 'testnet') {
        await switchNetwork(wallet, 'testnet')
      }

      const response = await connectBTCWallet({
        address,
        publicKey,
      })

      if (isString(response.message)) {
        const _signature = await signMessage(wallet, response.message)
        await connectBTCWallet({
          address,
          signature: _signature,
          message: response.message,
          publicKey,
        })
      }
      setLoadingWallet(undefined)
      toggleWalletModal()
      window.localStorage.setItem(CURRENT_BTC_WALLET, wallet)
    } catch (error) {
      disconnect(wallet)
      setLoadingWallet(undefined)
    }
  }

  return (
    <WalletModalWrapper open={walletModalOpen} onClose={() => toggleWalletModal()}>
      <WalletModalListItem
        icon={unisatLogo}
        name="Unisat Wallet"
        loading={loadingWallet === 'unisat'}
        onClick={() => handleClick('unisat')}
      />
      <WalletModalListItem
        icon={okxLogo}
        name="OKX Wallet"
        loading={loadingWallet === 'okx'}
        onClick={() => handleClick('okx')}
      />
    </WalletModalWrapper>
  )
}

export function WalletModalWrapper(props: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  const { open, onClose, children } = props

  return (
    <AriaModal isOpen={open} onClose={onClose} padding="56px">
      <Heading slot="title" className={'text-md mb-[18px] pl-4'}>
        {'Connect Wallet'}
      </Heading>
      <p className={'pl-4 text-xs leading-5'}>
        {"Choose how you want to connect. lf you don't have a wallet, you can select a provider and create one."}
      </p>

      <ul className={'mt-[22px]'} role={'menu'}>
        {children}
      </ul>
    </AriaModal>
  )
}

const liClasses =
  'flex h-[60px] items-center aria-disabled:pointer-events-none gap-6 text-sm px-3 rounded hover:bg-white/20 transition-colors cursor-pointer'

function WalletModalListItem(props: {
  loading?: boolean
  icon: string
  name: string
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLLIElement> | React.KeyboardEvent<HTMLLIElement>) => void
}) {
  const { onClick, loading, icon, name, disabled } = props

  const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
    if (!onClick || loading || disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      onClick(e)
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLLIElement>) => {
    if (!onClick || loading || disabled) return
    onClick(e)
  }

  return (
    <li
      className={liClasses}
      role={'menuitem'}
      tabIndex={loading || disabled ? -1 : 0}
      aria-disabled={loading || disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {loading ? <span className={'loading h-8 w-8'} /> : <img src={icon} alt={''} width={'32'} height={'32'} />}
      {name}
    </li>
  )
}

function getInjectedConnectors(connectors: readonly Connector[], excludeUniswapConnections?: boolean) {
  let isCoinbaseWalletBrowser = false
  const injectedConnectors = connectors.filter((c) => {
    // Special-case: Ignore coinbase eip6963-injected connector; coinbase connection is handled via the SDK connector.
    if (c.id === CONNECTION.COINBASE_RDNS) {
      if (isMobile) {
        isCoinbaseWalletBrowser = true
      }
      return false
    }

    return c.type === CONNECTION.INJECTED_CONNECTOR_TYPE && c.id !== CONNECTION.INJECTED_CONNECTOR_ID
  })

  // Special-case: Return deprecated window.ethereum connector when no eip6963 injectors are present.
  const fallbackInjector = getConnectorWithId(connectors, CONNECTION.INJECTED_CONNECTOR_ID, { shouldThrow: true })
  if (!injectedConnectors.length && Boolean(window.ethereum)) {
    return { injectedConnectors: [fallbackInjector], isCoinbaseWalletBrowser }
  }

  return { injectedConnectors, isCoinbaseWalletBrowser }
}

const CONNECTION = {
  WALLET_CONNECT_CONNECTOR_ID: 'walletConnect',
  INJECTED_CONNECTOR_ID: 'injected',
  INJECTED_CONNECTOR_TYPE: 'injected',
  COINBASE_SDK_CONNECTOR_ID: 'coinbaseWalletSDK',
  COINBASE_RDNS: 'com.coinbase.wallet',
  METAMASK_RDNS: 'io.metamask',
} as const

type ConnectorID = (typeof CONNECTION)[keyof typeof CONNECTION]

function getConnectorWithId(
  connectors: readonly Connector[],
  id: ConnectorID,
  options: { shouldThrow: true },
): Connector
function getConnectorWithId(connectors: readonly Connector[], id: ConnectorID): Connector | undefined
function getConnectorWithId(
  connectors: readonly Connector[],
  id: ConnectorID,
  options?: { shouldThrow: true },
): Connector | undefined {
  const connector = connectors.find((c) => c.id === id)
  if (!connector && options?.shouldThrow) {
    throw new Error(`Expected connector ${id} missing from wagmi context.`)
  }
  return connector
}

function useOrderedConnections() {
  const { connectors } = useConnect()

  return useMemo(() => {
    const { injectedConnectors, isCoinbaseWalletBrowser } = getInjectedConnectors(connectors)
    const SHOULD_THROW = { shouldThrow: true } as const
    const coinbaseSdkConnector = getConnectorWithId(connectors, CONNECTION.COINBASE_SDK_CONNECTOR_ID, SHOULD_THROW)
    const walletConnectConnector = getConnectorWithId(connectors, CONNECTION.WALLET_CONNECT_CONNECTOR_ID, SHOULD_THROW)

    if (!coinbaseSdkConnector || !walletConnectConnector) {
      throw new Error('Expected connector(s) missing from wagmi context.')
    }

    // Special-case: Only display the injected connector for in-wallet browsers.
    if (isMobile && injectedConnectors.length === 1) {
      return injectedConnectors
    }

    // Special-case: Only display the Coinbase connector in the Coinbase Wallet.
    if (isCoinbaseWalletBrowser) {
      return [coinbaseSdkConnector]
    }

    const orderedConnectors: Connector[] = []

    // Injected connectors should appear next in the list, as the user intentionally installed/uses them.
    orderedConnectors.push(...injectedConnectors)

    // WalletConnect and Coinbase are added last in the list.
    orderedConnectors.push(walletConnectConnector)
    orderedConnectors.push(coinbaseSdkConnector)

    // id 等于 io.metamask 的排在最前面，id 等于 com.okex.wallet 的排在最后面
    orderedConnectors.sort((a, b) => {
      if (a.id === 'io.metamask') return -1
      if (b.id === 'io.metamask') return 1
      if (a.id === 'com.okex.wallet') return 1
      if (b.id === 'com.okex.wallet') return -1
      return 0
    })

    return orderedConnectors
  }, [connectors])
}
