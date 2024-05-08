import React from 'react'
export default function TokenBlast(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns={'http://www.w3.org/2000/svg'} width={'1em'} height={'1em'} viewBox={'0 0 24 24'} {...props}>
      <path
        fill={'#FDFE04'}
        d={
          'm16.607 11.905l2.523-1.257l.87-2.67l-1.74-1.265H6.679L4 8.702h13.615l-.724 2.239h-5.46l-.525 1.636h5.46l-1.533 4.71l2.558-1.265l.913-2.825l-1.714-1.257z'
        }
      />
      <path fill={'#FDFE04'} d={'m7.85 15.264l1.575-4.909l-1.748-1.309l-2.626 8.241h9.782l.655-2.023z'} />
    </svg>
  )
}
