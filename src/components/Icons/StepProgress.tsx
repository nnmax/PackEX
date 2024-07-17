export default function StepProgress(props: React.SVGProps<SVGSVGElement>) {
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
              'M5,1L15,1L15,3L5,3L5,1ZM5,17L15,17L15,19L5,19L5,17ZM17,5L19,5L19,15L17,15L17,5ZM1,5L3,5L3,15L1,15L1,5ZM3,3L5,3L5,5L3,5L3,3ZM15,3L17,3L17,5L15,5L15,3ZM3,15L5,15L5,17L3,17L3,15ZM15,15L17,15L17,17L15,17L15,15Z'
            }
            fill={'#9E9E9E'}
            fillOpacity={'1'}
          />
        </g>
        <g>
          <rect x={'7'} y={'7'} width={'6'} height={'6'} rx={'0'} fill={'#FFC300'} fillOpacity={'1'} />
        </g>
      </g>
    </svg>
  )
}
