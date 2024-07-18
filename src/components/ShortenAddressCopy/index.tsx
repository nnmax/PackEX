import copy from 'copy-to-clipboard'
import { Button } from 'react-aria-components'
import { toast } from 'react-toastify'
import { shortenAddress } from '@/utils'
import Tooltip from '@/components/Tooltip'

export default function ShortenAddressCopy({ address, isBtcAddress }: { address: string; isBtcAddress?: boolean }) {
  return (
    <Tooltip title={address} className={'!max-w-max'}>
      <Button
        className={'cursor-copy'}
        onPress={() => {
          if (copy(address)) {
            toast.success('Copied!')
          } else {
            toast.error('Failed to copy!')
          }
        }}
      >
        {shortenAddress(address, 4, isBtcAddress)}
      </Button>
    </Tooltip>
  )
}
