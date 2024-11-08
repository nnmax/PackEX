import { Link } from 'react-router-dom'
import XLogo from '@/assets/images/X-logo.svg'
import { useWalletModalToggle } from '@/state/application/hooks'
import { useUserInfo } from '@/api/get-user'
import isAdmin from '@/utils/isAdmin'
import LogoBox from '@/components/Icons/LogoBox'
import Web3Status from '../Web3Status'
import LinkTab from '../LinkTab'
import NavTabs from '../NavTabs'

export default function AppBar() {
  const { data: userInfo } = useUserInfo()
  const toggleWalletModal = useWalletModalToggle()

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (!userInfo) {
      event.preventDefault()
      toggleWalletModal()
    }
  }

  return (
    <header className={'flex fixed top-0 w-full z-10 h-20 flex-row justify-center bg-[#030303] px-[--main-x-padding]'}>
      <div className={'flex w-full max-w-[--main-max-width] flex-row items-center'}>
        <Link to={'/'} className={'mr-10'}>
          <h1 className={'flex items-center gap-2'}>
            <LogoBox />
            <span className={'text-[25px] text-lemonYellow'}>{'PACKEX'}</span>
          </h1>
        </Link>

        <NavTabs>
          <LinkTab to={'/'}>{'Dex'}</LinkTab>
          <LinkTab to={'/pool'} onClick={handleClick}>
            {'Pools'}
          </LinkTab>
          <LinkTab to={'/asset'} onClick={handleClick}>
            {'Assets'}
          </LinkTab>
          <LinkTab to={'/earn'}>{'Earn'}</LinkTab>
          {isAdmin(userInfo?.ethAddress) && <LinkTab to={'/__admin'}>{'Admin'}</LinkTab>}
        </NavTabs>

        <div className={'ml-auto flex items-center gap-6'}>
          <a
            href={'https://twitter.com/packex_io'}
            target={'_blank'}
            className={'flex h-7 w-7 items-center justify-center rounded border border-white/50'}
            rel={'noreferrer'}
            aria-label={'X'}
          >
            <img src={XLogo} alt={''} />
          </a>
          <Web3Status />
        </div>
      </div>
    </header>
  )
}
