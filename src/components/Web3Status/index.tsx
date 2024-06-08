import { useWalletModalToggle } from '../../state/application/hooks'
import { shortenAddress } from '../../utils'
import WalletModal, { BTCWalletModal } from '../WalletModal'
import { Button, Menu, MenuItem, MenuTrigger, Popover } from 'react-aria-components'
import ArrowDown from '@/components/Icons/ArrowDown'
import Wallet from '@/components/Icons/Wallet'
import MaterialSymbolsLogout from '@/components/Icons/MaterialSymbolsLogout'
import { disconnectWallet } from '@/api'
import { useUserInfo } from '@/state/user/hooks'
import { useAccount, useDisconnect } from 'wagmi'
import { ButtonBase } from '@/components/Button'

function Web3StatusInner() {
  const { disconnect } = useDisconnect()
  const { isConnecting } = useAccount()
  const [userInfo] = useUserInfo()

  const toggleWalletModal = useWalletModalToggle()

  const handleDisconnect = () => {
    disconnect()
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
    <ButtonBase
      onPress={toggleWalletModal}
      className={'border border-aaa/50 gap-2'}
      loadingClassName={'!text-aaa/50'}
      isLoading={isConnecting}
    >
      <Wallet className={'text-xl'} />
      <span>{'Connect Wallet'}</span>
    </ButtonBase>
  )
}

export default function Web3Status() {
  return (
    <>
      <Web3StatusInner />
      <WalletModal />
      <BTCWalletModal />
    </>
  )
}
