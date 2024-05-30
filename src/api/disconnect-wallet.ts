import fetcher from '@/utils/fetcher'

export default function disconnectWallet() {
  return fetcher('/disconnect-wallet', {
    method: 'POST',
    disabledErrorToast: true,
  })
    .catch(() => {})
    .finally(() => {
      if (['/', '/swap', '/pax'].indexOf(window.location.pathname) === -1) {
        window.location.replace('/')
      }
    })
}
