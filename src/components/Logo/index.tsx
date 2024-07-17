import { useState } from 'react'
import HelpIcon from '@/assets/images/help-circle.svg'

const BAD_SRCS: Record<string, true> = {}

export interface LogoProps extends Pick<React.ImgHTMLAttributes<HTMLImageElement>, 'style' | 'alt' | 'className'> {
  srcs: string[]
}

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */
export default function Logo({ srcs, alt, ...rest }: LogoProps) {
  const [, refresh] = useState<number>(0)

  const src: string | undefined = srcs.find((src) => !BAD_SRCS[src])

  if (src) {
    return (
      <img
        {...rest}
        alt={alt}
        src={src}
        onError={() => {
          // eslint-disable-next-line react-compiler/react-compiler
          if (src) BAD_SRCS[src] = true
          refresh((i) => i + 1)
        }}
      />
    )
  }

  return <img {...rest} src={HelpIcon} alt={''} />
}
