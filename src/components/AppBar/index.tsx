import LogoBoxSvg from '../../assets/images/logo-box.svg'
import LogoTextSvg from '../../assets/images/logo-text.svg'
import NavTabs from '../NavTabs'
import LinkTab from '../LinkTab'
import { Link } from 'react-router-dom'
import Web3Status from '../Web3Status'

export default function AppBar() {
  return (
    <header className={'flex h-[80px] flex-row justify-center bg-[#030303] px-[56px]'}>
      <div className={'flex w-full max-w-[1684px] flex-row items-center'}>
        <Link to={'/'} className={'mr-10'}>
          <h1 className={'sr-only'}>{'PREOTC'}</h1>
          <div className={'flex items-center gap-2'}>
            <img src={LogoBoxSvg} alt={''} />
            <img src={LogoTextSvg} alt={''} />
          </div>
        </Link>

        <NavTabs>
          <LinkTab to={'/swap'}>{'Dex'}</LinkTab>
          <LinkTab to={'/pool/all'}>{'Pools'}</LinkTab>
          <LinkTab to={'/asset'}>{'Assets'}</LinkTab>
          <LinkTab to={'/pex'}>{'$PEX'}</LinkTab>
        </NavTabs>

        <div className={'ml-auto'}>
          <Web3Status />
        </div>
      </div>
    </header>
  )
}
