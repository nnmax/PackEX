import { Link } from 'react-router-dom'
import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft'

export default function PoolAdd() {
  return (
    <div className={'py-4'}>
      <Link to={'/asset'} className={'inline-flex h-8 items-center gap-2 text-sm'}>
        <PixelarticonsChevronLeft aria-hidden className={'text-xl'} />
        {'Add'}
      </Link>
    </div>
  )
}
