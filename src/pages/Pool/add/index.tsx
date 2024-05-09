import { useHistory } from 'react-router-dom'
import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft'

export default function PoolAdd() {
  const history = useHistory()

  const goBack = () => {
    history.goBack()
  }

  return (
    <div className={'py-4'}>
      <span onClick={goBack} className={'inline-flex h-8 cursor-pointer items-center gap-2 text-sm'}>
        <PixelarticonsChevronLeft aria-hidden className={'text-xl'} />
        {'Add'}
      </span>
    </div>
  )
}
