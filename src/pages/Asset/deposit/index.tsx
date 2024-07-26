import { Link, useLocation } from 'react-router-dom'
import QueryString from 'qs'
import { toast } from 'react-toastify'
import { useRef, useState } from 'react'
import depositRunes from '@/api/deposit-runes'
import useBTCWallet from '@/hooks/useBTCWallet'
import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft'
import { useRunesBalance } from '@/api/get-runes-balance'
import useDocumentTitle from '@/hooks/useDocumentTitle'
import useDepositConfirm from '@/api/deposit-confirm'
import FormCard from '../components/FormCard'
import type { Asset } from '@/api'

export default function Deposit() {
  useDocumentTitle('Deposit')
  const { search } = useLocation()
  const [loading, setLoading] = useState(false)
  const data = QueryString.parse(search, {
    ignoreQueryPrefix: true,
  }) as unknown as Record<keyof Asset, string>
  const { address: btcAddress, currentWallet, signPsbt, pushPsbt, publicKey, connectedAndSigned } = useBTCWallet()
  const formCardRef = useRef<{ reset: () => void }>(null)
  const { mutateAsync: depositConfirm } = useDepositConfirm()
  const { data: runesBalance } = useRunesBalance({
    btcAddress: btcAddress!,
    runesId: data.runesId,
    enabled: !!btcAddress && !!data.runesId && connectedAndSigned,
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!btcAddress) {
      toast.error('btcAddress is required')
      throw new Error('btcAddress is required')
    }
    if (!publicKey) {
      toast.error('publicKey is required')
      throw new Error('publicKey is required')
    }
    setLoading(true)
    const formData = Object.fromEntries(new FormData(event.currentTarget))

    try {
      const { messageToBeSigned } = await depositRunes({
        btcAddress: btcAddress,
        amount: formData.amount as string,
        decimals: Number(data.decimals),
        runesId: data.runesId,
        publicKey,
      })
      const signature = await signPsbt(currentWallet!, messageToBeSigned)
      const txHash = await pushPsbt(currentWallet!, signature)
      await depositConfirm({
        txHash,
        btcAddress,
        runesId: data.runesId,
        amount: formData.amount as string,
      })
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
        type={'deposit'}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
