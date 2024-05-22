import { useState, useEffect } from 'react'
import { Web3Provider } from '@ethersproject/providers'
import { isMobile } from 'react-device-detect'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import usePrevious from '../../hooks/usePrevious'
import { useWalletModalOpen, useWalletModalToggle } from '../../state/application/hooks'
import { MESSAGE_KEY, SIGNATURE_KEY, SUPPORTED_WALLETS, USER_KEY } from '../../constants'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { AbstractConnector } from '@web3-react/abstract-connector'
import Dialog from '@/components/Dialog'
import { connectWallet, disconnectWallet } from '@/api'
import { useUserInfo } from '@/state/user/hooks'

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending',
}

export default function WalletModal() {
  // important that these are destructed from the account-specific web3-react context
  const { active, account, connector, activate, error, deactivate } = useWeb3React<Web3Provider>()
  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)
  const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>()
  const [, updateUserInfo] = useUserInfo()
  const walletModalOpen = useWalletModalOpen()
  const toggleWalletModal = useWalletModalToggle()

  const previousAccount = usePrevious(account)

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && walletModalOpen) {
      toggleWalletModal()
    }
  }, [account, previousAccount, toggleWalletModal, walletModalOpen])

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [walletModalOpen])

  useEffect(() => {
    if (error instanceof UnsupportedChainIdError) {
      deactivate()
      disconnectWallet().catch(() => {})
    }
  }, [error, deactivate])

  // close modal when a connection is successful
  const activePrevious = usePrevious(active)
  const connectorPrevious = usePrevious(connector)
  useEffect(() => {
    if (walletModalOpen && ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [setWalletView, active, error, connector, walletModalOpen, activePrevious, connectorPrevious])

  const tryActivation = async (connector: AbstractConnector | undefined) => {
    setPendingWallet(connector) // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING)

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

    if (!connector) return

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

        setWalletView(WALLET_VIEWS.ACCOUNT)
        return false
      })

    if (!result) {
      setPendingWallet(undefined)
      setWalletView(WALLET_VIEWS.ACCOUNT)
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
        if (typeof connectWalletResponse2 === 'string') return
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
    setWalletView(WALLET_VIEWS.ACCOUNT)
  }

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    return Object.keys(SUPPORTED_WALLETS).map((key) => {
      const option = SUPPORTED_WALLETS[key]

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <ListItem
            name={option.name}
            loading={walletView === WALLET_VIEWS.PENDING && option.connector === pendingWallet}
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
    <Dialog open={walletModalOpen} onClose={() => toggleWalletModal()} panelClassName={'!max-w-[432px] !px-4 !py-8'}>
      <Dialog.Title className={'text-md mb-[18px] pl-4'}>{'Connect Wallet'}</Dialog.Title>
      <Dialog.Description className={'pl-4 text-xs leading-5'}>
        {"Choose how you want to connect. lf you don't have a wallet, you can select a provider and create one."}
      </Dialog.Description>

      <ul className={'mt-[22px]'} role={'menu'}>
        {getOptions()}
      </ul>
    </Dialog>
  )
}

const liClasses =
  'flex h-[60px] items-center aria-disabled:pointer-events-none gap-6 text-sm px-3 rounded hover:bg-white/20 transition-colors cursor-pointer'

function ListItem(props: {
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
