import Tooltip from '@/components/Tooltip'
import { shortenAddress } from '@/utils'
import copy from 'copy-to-clipboard'
import { Button } from 'react-aria-components'
import { toast } from 'react-toastify'

export default function ShortenAddressCopy({ address, isBtcAddress }: { address: string; isBtcAddress?: boolean }) {
  return (
    <Tooltip title={address}>
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
