import { Link } from 'react-router-dom'
import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft'
import FormCard from '../components/FormCard'

export default function Deposit() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = Object.fromEntries(new FormData(event.currentTarget))
    console.log('%c [ formData ]-9', 'font-size:13px; background:pink; color:#bf2c9f;', formData)
  }

  return (
    <div className={'py-4'}>
      <Link to={'/asset'} className={'inline-flex h-8 items-center gap-2 text-sm'}>
        <PixelarticonsChevronLeft aria-hidden className={'text-xl'} />
        {'Deposit'}
      </Link>

      <FormCard type="deposit" onSubmit={handleSubmit} />
    </div>
  )
}
