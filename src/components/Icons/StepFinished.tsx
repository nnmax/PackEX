export default function StepFinished(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns={'http://www.w3.org/2000/svg'}
      fill={'none'}
      version={'1.1'}
      width={'20'}
      height={'20'}
      viewBox={'0 0 20 20'}
      {...props}
    >
      <g>
        <g>
          <path
            d={
              'M15,1L5,1L5,3L3,3L3,5L1,5L1,15L3,15L3,17L5,17L5,19L15,19L15,17L17,17L17,15L19,15L19,5L17,5L17,3L15,3L15,1Z'
            }
            fillRule={'evenodd'}
            fill={'#00B578'}
            fillOpacity={'1'}
          />
        </g>
        <g>
          <path
            d={
              'M15,6L13,6L13,8.03922L15,8.03922L15,6ZM13,8L11,8L11,10.03922L13,10.03922L13,8ZM11,10L9,10L9,12.03922L11,12.03922L11,10ZM9,12L7,12L7,14.03922L9,14.03922L9,12ZM7,10L5,10L5,12.03922L7,12.03922L7,10Z'
            }
            fill={'#FFFFFF'}
            fillOpacity={'1'}
          />
        </g>
      </g>
    </svg>
  )
}
