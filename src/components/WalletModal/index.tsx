import { useState, useEffect } from 'react'
import ReactGA from 'react-ga'
import { isMobile } from 'react-device-detect'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import usePrevious from '../../hooks/usePrevious'
import { useWalletModalOpen, useWalletModalToggle } from '../../state/application/hooks'
import { SUPPORTED_WALLETS } from '../../constants'
import { fortmatic } from '../../connectors'
import { OVERLAY_READY } from '../../connectors/Fortmatic'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { AbstractConnector } from '@web3-react/abstract-connector'
import Dialog from '@/components/Dialog'

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending',
}

export default function WalletModal() {
  // important that these are destructed from the account-specific web3-react context
  const { active, account, connector, activate, error } = useWeb3React()

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)

  const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>()

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

  // close modal when a connection is successful
  const activePrevious = usePrevious(active)
  const connectorPrevious = usePrevious(connector)
  useEffect(() => {
    if (walletModalOpen && ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [setWalletView, active, error, connector, walletModalOpen, activePrevious, connectorPrevious])

  const tryActivation = async (connector: AbstractConnector | undefined) => {
    let name = ''
    Object.keys(SUPPORTED_WALLETS).map((key) => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return (name = SUPPORTED_WALLETS[key].name)
      }
      return true
    })
    // log selected wallet
    ReactGA.event({
      category: 'Wallet',
      action: 'Change Wallet',
      label: name,
    })
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

    connector &&
      activate(connector, undefined, true).catch((error) => {
        if (error instanceof UnsupportedChainIdError) {
          activate(connector) // a little janky...can't use setError because the connector isn't set
        } else {
          setWalletView(WALLET_VIEWS.ACCOUNT)
        }
      })
  }

  // close wallet modal if fortmatic modal is active
  useEffect(() => {
    fortmatic.on(OVERLAY_READY, () => {
      toggleWalletModal()
    })
  }, [toggleWalletModal])

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
            onClick={() => {
              option.connector === connector
                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                : !option.href && tryActivation(option.connector)
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
