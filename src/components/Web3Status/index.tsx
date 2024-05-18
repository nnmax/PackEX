import { useWeb3React } from '@web3-react/core'
import { NetworkContextName } from '../../constants'
import { useWalletModalToggle } from '../../state/application/hooks'
import { shortenAddress } from '../../utils'
import WalletModal from '../WalletModal'
import { Button, Menu, MenuItem, MenuTrigger, Popover } from 'react-aria-components'
import ArrowDown from '@/components/Icons/ArrowDown'
import Wallet from '@/components/Icons/Wallet'
import MaterialSymbolsLogout from '@/components/Icons/MaterialSymbolsLogout'
import { disconnectWallet } from '@/api'
import { useUserInfo } from '@/state/user/hooks'

function Web3StatusInner() {
  const { deactivate } = useWeb3React()
  const [userInfo] = useUserInfo()

  const toggleWalletModal = useWalletModalToggle()

  const handleDisconnect = () => {
    deactivate()
    disconnectWallet()
  }

  if (userInfo) {
    return (
      <MenuTrigger>
        <Button className={'flex items-center text-xs h-9 px-2 rounded gap-2 bg-[#192129] outline-none'}>
          <span>{shortenAddress(userInfo.ethAddress)}</span>
          <ArrowDown className={'text-lemonYellow text-xl'} />
        </Button>

        <Popover className={'outline-none'}>
          <Menu className={'rounded bg-[#192129] px-2 outline-none'}>
            <MenuItem
              onAction={handleDisconnect}
              className={'flex items-center gap-1 text-xs h-9 text-[#A5A5A5] cursor-pointer outline-none'}
            >
              <span className={'mr-2 text-2xl'}>
                <MaterialSymbolsLogout />
              </span>
              <span>{'Disconnect'}</span>
            </MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>
    )
  }

  return (
    <Button
      onPress={toggleWalletModal}
      className={'flex h-9 items-center rounded border border-solid border-aaa/50 px-2 text-xs gap-2'}
    >
      <Wallet className={'text-xl'} />
      <span>{'Connect Wallet'}</span>
    </Button>
  )
}

export default function Web3Status() {
  const { active } = useWeb3React()
  const contextNetwork = useWeb3React(NetworkContextName)

  if (!contextNetwork.active && !active) {
    return null
  }

  return (
    <>
      <Web3StatusInner />
      <WalletModal />
    </>
  )
}
