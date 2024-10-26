import { Button, Dialog, Menu, MenuItem, MenuTrigger, Popover } from 'react-aria-components'
import { useAccount, useDisconnect } from 'wagmi'
import { useMemo } from 'react'
import clsx from 'clsx'
import ArrowDown from '@/components/Icons/ArrowDown'
import Wallet from '@/components/Icons/Wallet'
import MaterialSymbolsLogout from '@/components/Icons/MaterialSymbolsLogout'
import { disconnectWallet } from '@/api'
import { ButtonBase } from '@/components/Button'
import { useUserInfo } from '@/api/get-user'
import { TokenEth } from '@/components/Icons/TokenEth'
import TokenBlast from '@/components/Icons/TokenBlast'
import GoldIcon from '@/components/Icons/GoldIcon'
import usePointGold from '@/api/get-point-gold-info'
import WalletModal, { BTCWalletModal } from '../WalletModal'
import { shortenAddress } from '../../utils'
import { useWalletModalToggle } from '../../state/application/hooks'

const chainLogos = new Map([
  [1, TokenEth],
  [81457, TokenBlast],
  [168587773, TokenBlast],
])

function Web3StatusInner() {
  const { disconnect } = useDisconnect()
  const { isConnecting, chainId } = useAccount()
  const { data: userInfo } = useUserInfo()
  const { data: pointGoldInfo, isLoading: isLoadingPointGoldInfo } = usePointGold()

  const toggleWalletModal = useWalletModalToggle()

  const handleDisconnect = () => {
    disconnect()
    disconnectWallet()
  }

  const ChainLogo = useMemo(() => (chainId ? chainLogos.get(chainId) : undefined), [chainId])

  if (userInfo) {
    return (
      <>
        <MenuTrigger>
          <Button className={'flex items-center text-xl h-9 pl-[15px] pr-[7px] rounded border border-[#FCFE03]'}>
            <TokenBlast color={'#FCFE03'} />
            <GoldIcon className={'ml-4 mr-6'} />
            <ArrowDown className={'text-[#FCFE03]'} />
          </Button>

          <Popover crossOffset={-50} className={'rounded bg-[#1D1D1D] p-4 max-w-[366px] w-full'}>
            <Dialog className={'flex flex-col w-full outline-none'} aria-label={'Blast points and gold'}>
              <div className={'text-xs flex justify-between items-center'}>
                <div className={'text-[#FCFE03] flex items-center gap-3'}>
                  <TokenBlast color={'#FCFE03'} className={'text-[24px]'} />
                  <span>{'BLAST POINTS (100%)'}</span>
                </div>
                <span className={clsx(isLoadingPointGoldInfo && 'loading')}>{pointGoldInfo?.pointAmount ?? '-'}</span>
              </div>

              <hr className={'border-white/30 h-px w-full my-[18px]'} />

              <div className={'text-xs flex justify-between items-center'}>
                <div className={'text-[#FCFE03] flex items-center gap-3'}>
                  <GoldIcon className={'text-[24px]'} />
                  <span className={'flex items-center gap-[23px]'}>
                    <span>{'BLAST GOLD'}</span>
                    <span>{'(100%)'}</span>
                  </span>
                </div>
                <span className={clsx(isLoadingPointGoldInfo && 'loading')}>{pointGoldInfo?.goldAmount ?? '-'}</span>
              </div>
              <p className={'text-[#9E9E9E] text-xs leading-5 mt-[14px] ml-9'}>
                {'Blast Gold will be distributed in proportion to the contribution made on the day before distribution'}
              </p>
            </Dialog>
          </Popover>
        </MenuTrigger>

        <MenuTrigger>
          <Button className={'flex items-center text-xs h-9 px-2 rounded gap-2 bg-[#192129]'}>
            {ChainLogo && <ChainLogo className={'text-[20px]'} />}
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
      </>
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
