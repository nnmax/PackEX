export default function ArrowDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns={'http://www.w3.org/2000/svg'}
      fill={'none'}
      version={'1.1'}
      width={'18'}
      height={'18'}
      viewBox={'0 0 18 18'}
      {...props}
    >
      <g transform={'matrix(0,1,-1,0,18,-18)'}>
        <g transform={'matrix(0,1,1,0,21,-21)'}>
          <path
            d={
              'M25.25,4.25L27.25,4.25L27.25,6.25L25.25,6.25L25.25,4.25ZM23.25,2.25L25.25,2.25L25.25,4.25L23.25,4.25L23.25,2.25ZM35.25,2.25L37.25,2.25L37.25,4.25L35.25,4.25L35.25,2.25ZM27.25,6.25L29.25,6.25L29.25,8.25L27.25,8.25L27.25,6.25ZM29.25,8.25L31.25,8.25L31.25,10.25L29.25,10.25L29.25,8.25ZM31.25,6.25L33.25,6.25L33.25,8.25L31.25,8.25L31.25,6.25ZM33.25,4.25L35.25,4.25L35.25,6.25L33.25,6.25L33.25,4.25Z'
            }
            fill={'currentColor'}
            fillOpacity={'1'}
          />
        </g>
      </g>
    </svg>
  )
}
