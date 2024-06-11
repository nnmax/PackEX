import { Link, useLocation } from 'react-router-dom'
import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft'
import FormCard from '../components/FormCard'
import QueryString from 'qs'
import { Asset } from '@/api'
import depositRunes from '@/api/deposit-runes'
import useBTCWallet from '@/hooks/useBTCWallet'
import { toast } from 'react-toastify'
import { useRef, useState } from 'react'

export default function Deposit() {
  const { search } = useLocation()
  const [loading, setLoading] = useState(false)
  const data = QueryString.parse(search, {
    ignoreQueryPrefix: true,
  }) as unknown as Record<keyof Asset, string>
  const { address, signMessage, currentWallet } = useBTCWallet()
  const formCardRef = useRef<{ reset: () => void }>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!address) {
      toast.error('address is required')
      throw new Error('address is required')
    }
    setLoading(true)
    const formData = Object.fromEntries(new FormData(event.currentTarget))

    try {
      const { messageToBeSigned } = await depositRunes({
        address,
        amount: formData.amount as string,
        decimals: Number(data.decimals),
        runesId: Number(data.id),
      })
      const signature = await signMessage(currentWallet!, messageToBeSigned)
      console.log('%c [ signature ]-33', 'font-size:13px; background:pink; color:#bf2c9f;', signature)
      toast.success('Deposit successfully')
      if (formCardRef.current) formCardRef.current.reset()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={'py-4'}>
      <Link to={'/asset'} className={'inline-flex h-8 items-center gap-2 text-sm'}>
        <PixelarticonsChevronLeft aria-hidden className={'text-xl'} />
        {'Deposit'}
      </Link>

      <FormCard loading={loading} ref={formCardRef} data={data} type="deposit" onSubmit={handleSubmit} />
    </div>
  )
}
