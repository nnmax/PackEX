import { useState, useEffect } from 'react'
import { Web3Provider } from '@ethersproject/providers'
import { isMobile } from 'react-device-detect'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import {
  useBTCWalletModalOpen,
  useBTCWalletModalToggle,
  useWalletModalOpen,
  useWalletModalToggle,
} from '../../state/application/hooks'
import {
  BTC_MESSAGE_KEY,
  BTC_SIGNATURE_KEY,
  CURRENT_BTC_WALLET,
  MESSAGE_KEY,
  SIGNATURE_KEY,
  SUPPORTED_WALLETS,
  USER_KEY,
} from '../../constants'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { connectBTCWallet, connectWallet, disconnectWallet } from '@/api'
import { useUserInfo } from '@/state/user/hooks'
import okxLogo from '../../assets/images/okx.svg'
import unisatLogo from '../../assets/images/unisat.svg'
import useBTCWallet, { BTCWallet } from '@/hooks/useBTCWallet'
import { isString } from 'lodash-es'
import AriaModal from '@/components/AriaModal'
import { Heading } from 'react-aria-components'

export default function WalletModal() {
  // important that these are destructed from the account-specific web3-react context
  const { activate, error, deactivate } = useWeb3React<Web3Provider>()
  const [pendingWallet, setPendingWallet] = useState<AbstractConnector>()
  const [, updateUserInfo] = useUserInfo()
  const walletModalOpen = useWalletModalOpen()
  const toggleWalletModal = useWalletModalToggle()

  useEffect(() => {
    if (error instanceof UnsupportedChainIdError) {
      deactivate()
      disconnectWallet().catch(() => {})
    }
  }, [error, deactivate])

  const tryActivation = async (connector: AbstractConnector | undefined) => {
    setPendingWallet(connector) // set wallet for pending view

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (
      connector instanceof WalletConnectConnector &&
      connector.walletConnectProvider &&
      'wc' in connector.walletConnectProvider &&
      connector.walletConnectProvider.wc &&
      // @ts-ignore
      connector.walletConnectProvider.wc.uri
    ) {
      connector.walletConnectProvider = undefined
    }

    if (!connector) {
      setPendingWallet(undefined)
      return
    }

    const result = await activate(connector, undefined, true)
      .then(() => true)
      .catch(async (error) => {
        if (error instanceof UnsupportedChainIdError) {
          const provider: Web3Provider = await connector.getProvider()
          const chainId = '0x' + Number.parseInt(process.env.REACT_APP_CHAIN_ID!, 10).toString(16)
          return provider
            .send('wallet_switchEthereumChain', [{ chainId }])
            .then(() => true)
            .catch(async (err: { code: number }) => {
              // This error code indicates that the chain has not been added to MetaMask
              if (err.code === 4902) {
                const config = JSON.parse(process.env.REACT_APP_CHAIN_CONFIRM!)
                return provider
                  .send('wallet_addEthereumChain', [
                    {
                      chainId,
                      ...config,
                    },
                  ])
                  .then(() => true)
                  .catch(() => false)
              }
              return false
            })
        }
        return false
      })

    if (!result) {
      setPendingWallet(undefined)
      return
    }

    const _account = await connector.getAccount()
    if (!_account) return

    const s = window.localStorage.getItem(SIGNATURE_KEY)
    const m = window.localStorage.getItem(MESSAGE_KEY)
    const connectWalletResponse = await connectWallet({
      address: _account,
      signature: s,
      message: m,
    }).catch((error) => {
      setPendingWallet(undefined)
      throw error
    })

    if (typeof connectWalletResponse === 'string') {
      const provider = await connector.getProvider()
      if (provider && typeof provider.request === 'function') {
        const signatureawait = (await provider.request({
          method: 'personal_sign',
          params: [connectWalletResponse, _account],
        })) as string
        const connectWalletResponse2 = await connectWallet({
          address: _account,
          signature: signatureawait,
          message: connectWalletResponse,
        })
        if (typeof connectWalletResponse2 === 'string') {
          setPendingWallet(undefined)
          return
        }
        window.localStorage.setItem(SIGNATURE_KEY, signatureawait)
        window.localStorage.setItem(MESSAGE_KEY, connectWalletResponse)
        window.localStorage.setItem(USER_KEY, JSON.stringify(connectWalletResponse2))
        updateUserInfo(connectWalletResponse2)
      }
    } else {
      window.localStorage.setItem(USER_KEY, JSON.stringify(connectWalletResponse))
      updateUserInfo(connectWalletResponse)
    }
    setPendingWallet(undefined)
    toggleWalletModal()
  }

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    return Object.keys(SUPPORTED_WALLETS).map((key) => {
      const option = SUPPORTED_WALLETS[key]

      // return rest of options
      return (
        !isMobile && (
          <WalletModalListItem
            name={option.name}
            loading={option.connector === pendingWallet}
            onClick={async () => {
              await tryActivation(option.connector)
            }}
            key={key}
            icon={require('../../assets/images/' + option.iconName)}
          />
        )
      )
    })
  }

  return (
    <WalletModalWrapper open={walletModalOpen} onClose={() => toggleWalletModal()}>
      {getOptions()}
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

      if (process.env.APP_ENV === 'prod' && network !== 'livenet') {
        await switchNetwork(wallet, 'livenet')
      } else if (process.env.APP_ENV === 'dev' && network !== 'testnet') {
        await switchNetwork(wallet, 'testnet')
      }

      const signature = window.localStorage.getItem(BTC_SIGNATURE_KEY)
      const message = window.localStorage.getItem(BTC_MESSAGE_KEY)
      const response = await connectBTCWallet({
        address,
        signature,
        message,
        publicKey,
      })

      if (isString(response)) {
        const _signature = await signMessage(wallet, response)
        window.localStorage.setItem(BTC_MESSAGE_KEY, response)
        window.localStorage.setItem(BTC_SIGNATURE_KEY, _signature)
        await connectBTCWallet({
          address,
          signature: _signature,
          message: response,
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

export function WalletModalListItem(props: {
  loading?: boolean
  icon: string
  name: string
  onClick?: (e: React.MouseEvent<HTMLLIElement> | React.KeyboardEvent<HTMLLIElement>) => void
}) {
  const { onClick, loading, icon, name } = props

  const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick && !loading) {
      onClick(e)
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLLIElement>) => {
    if (onClick && !loading) {
      onClick(e)
    }
  }

  return (
    <li
      className={liClasses}
      role={'menuitem'}
      tabIndex={loading ? -1 : 0}
      aria-disabled={loading}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {loading ? <span className={'loading h-8 w-8'} /> : <img src={icon} alt={''} width={'32'} height={'32'} />}
      {name}
    </li>
  )
}
