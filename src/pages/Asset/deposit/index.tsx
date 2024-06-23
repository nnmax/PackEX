import { Link, useLocation } from 'react-router-dom'
import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft'
import FormCard from '../components/FormCard'
import QueryString from 'qs'
import { Asset } from '@/api'
import depositRunes from '@/api/deposit-runes'
import useBTCWallet from '@/hooks/useBTCWallet'
import { toast } from 'react-toastify'
import { useRef, useState } from 'react'
import { useRunesBalance } from '@/api/get-runes-balance'
import useDocumentTitle from '@/hooks/useDocumentTitle'

export default function Deposit() {
  useDocumentTitle('Deposit')
  const { search } = useLocation()
  const [loading, setLoading] = useState(false)
  const data = QueryString.parse(search, {
    ignoreQueryPrefix: true,
  }) as unknown as Record<keyof Asset, string>
  const { address, currentWallet, signPsbt, pushPsbt, publicKey } = useBTCWallet()
  const formCardRef = useRef<{ reset: () => void }>(null)
  const { data: runesBalance } = useRunesBalance({
    btcAddress: address!,
    runesId: data.runesId,
    enabled: !!address && !!data.runesId,
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!address) {
      toast.error('address is required')
      throw new Error('address is required')
    }
    if (!publicKey) {
      toast.error('publicKey is required')
      throw new Error('publicKey is required')
    }
    setLoading(true)
    const formData = Object.fromEntries(new FormData(event.currentTarget))

    try {
      const { messageToBeSigned } = await depositRunes({
        btcAddress: address,
        amount: formData.amount as string,
        decimals: Number(data.decimals),
        runesId: data.runesId,
        publicKey,
      })
      const signature = await signPsbt(currentWallet!, messageToBeSigned)
      await pushPsbt(currentWallet!, signature)
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

      <FormCard
        runesBalance={runesBalance}
        loading={loading}
        ref={formCardRef}
        data={data}
        type="deposit"
        onSubmit={handleSubmit}
      />
    </div>
  )
}
