import verify451Pathname from '@/utils/verify451Pathname'
import { useEffect } from 'react'

const originalFetch = window.fetch
window.fetch = (...args) => {
  try {
    verify451Pathname()
  } catch (error) {
    return Promise.reject(new Error('You are from a blocked IP'))
  }
  return originalFetch(...args)
}

export default function Page451() {
  useEffect(() => {
    document.title = '451 Unavailable For Legal Reasons - PACKEX'
    document.documentElement.classList.add('pointer-events-none')
  }, [])

  return (
    <div className="flex flex-col items-center gap-12 pt-24">
      <h1 className="text-[22px]">You are from a blocked IP</h1>
      <p className="leading-10 text-center">
        Sorry, PACKEX is not available in your country.
        <br /> Please connect from other locations.
      </p>
    </div>
  )
}
