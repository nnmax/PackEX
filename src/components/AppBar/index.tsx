import LogoBoxSvg from '../../assets/images/logo-box.svg'
import NavTabs from '../NavTabs'
import LinkTab from '../LinkTab'
import { Link } from 'react-router-dom'
import Web3Status from '../Web3Status'
import XLogo from '@/assets/images/X-logo.svg'
import { useWalletModalToggle } from '@/state/application/hooks'
import { useUserInfo } from '@/state/user/hooks'

export default function AppBar() {
  const [userInfo] = useUserInfo()
  const toggleWalletModal = useWalletModalToggle()

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (!userInfo) {
      event.preventDefault()
      toggleWalletModal()
    }
  }

  return (
    <header className={'flex h-20 flex-row justify-center bg-[#030303] px-[--main-x-padding]'}>
      <div className={'flex w-full max-w-[--main-max-width] flex-row items-center'}>
        <Link to={'/'} className={'mr-10'}>
          <h1 className={'flex items-center gap-2'}>
            <img src={LogoBoxSvg} alt={''} />
            <span className={'text-[25px] text-lemonYellow'}>PACKEX</span>
          </h1>
        </Link>

        <NavTabs>
          <LinkTab to={'/swap'}>{'Dex'}</LinkTab>
          <LinkTab to={'/pool'} onClick={handleClick}>
            {'Pools'}
          </LinkTab>
          <LinkTab to={'/asset'} onClick={handleClick}>
            {'Assets'}
          </LinkTab>
          <LinkTab to={'/pax'}>{'$PAX'}</LinkTab>
        </NavTabs>

        <div className={'ml-auto flex items-center gap-6'}>
          <a
            href={'https://twitter.com/packex_io'}
            className={'flex h-7 w-7 items-center justify-center rounded border border-white/50'}
          >
            <img src={XLogo} alt="" />
          </a>
          <Web3Status />
        </div>
      </div>
    </header>
  )
}
