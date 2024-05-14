import LogoBoxSvg from '../../assets/images/logo-box.svg'
import NavTabs from '../NavTabs'
import LinkTab from '../LinkTab'
import { Link } from 'react-router-dom'
import Web3Status from '../Web3Status'
import XLogo from '@/assets/images/X-logo.svg'

export default function AppBar() {
  return (
    <header className={'flex h-[80px] flex-row justify-center bg-[#030303] px-[56px]'}>
      <div className={'flex w-full max-w-[1684px] flex-row items-center'}>
        <Link to={'/'} className={'mr-10'}>
          <h1 className={'flex items-center gap-2'}>
            <img src={LogoBoxSvg} alt={''} />
            <span className={'text-[25px] text-lemonYellow'}>PACKEX</span>
          </h1>
        </Link>

        <NavTabs>
          <LinkTab to={'/swap'}>{'Dex'}</LinkTab>
          <LinkTab to={'/pool/all'}>{'Pools'}</LinkTab>
          <LinkTab to={'/asset'}>{'Assets'}</LinkTab>
          <LinkTab to={'/pex'}>{'$PEX'}</LinkTab>
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
