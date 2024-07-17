import { Link } from 'react-router-dom'
import { ButtonPrimary } from '@/components/Button'

export default function NotFound() {
  return (
    <div className={'flex flex-col gap-6 items-center justify-center pt-20'}>
      <h1 className={'text-6xl font-bold text-gray-800'}>{'404'}</h1>
      <p className={'text-xl font-medium text-gray-600 mt-4'}>{'Page not found'}</p>
      <Link to={'/'} tabIndex={-1}>
        <ButtonPrimary>{'Go Home'}</ButtonPrimary>
      </Link>
    </div>
  )
}
