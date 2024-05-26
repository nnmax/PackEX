import { Link } from 'react-router-dom'
import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft'
import FormCard from '../components/FormCard'
import { useBTCWalletModalToggle } from '@/state/application/hooks'
import useBTCWallet from '@/hooks/useBTCWallet'

export default function Deposit() {
  const toggleBTCWalletModal = useBTCWalletModalToggle()
  const { address } = useBTCWallet()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = Object.fromEntries(new FormData(event.currentTarget))
    console.log('%c [ formData ]-9', 'font-size:13px; background:pink; color:#bf2c9f;', formData)
    // TODO: 对接 Deposit 接口
  }

  return (
    <div className={'py-4'}>
      <Link to={'/asset'} className={'inline-flex h-8 items-center gap-2 text-sm'}>
        <PixelarticonsChevronLeft aria-hidden className={'text-xl'} />
        {'Deposit'}
      </Link>

      <FormCard
        type="deposit"
        onSubmit={handleSubmit}
        showConnectWalletButton={!address}
        onWalletToggle={toggleBTCWalletModal}
      />
    </div>
  )
}
