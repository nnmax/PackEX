import { useState } from 'react'
import clsx from 'clsx'
import { TabList, Tabs, Tab, TabPanel } from 'react-aria-components'
import SettingSvg from '@/assets/images/settings-logo.svg'
import Tooltip from '@/components/Tooltip'
import { useUserSlippageTolerance } from '@/state/user/hooks'

const tabClasses =
  'flex w-24 items-center justify-center transition-colors aria-selected:bg-lemonYellow aria-selected:text-black'

const tabPanelClasses = 'px-2 py-4'

const tooltipClasses =
  'relative !w-[276px] before:absolute before:right-0 before:bottom-0 before:w-[100px] before:[clip-path:polygon(7px_0,100%_0,100%_100%,0_100%)] before:h-1 before:bg-[var(--body-bg)]'

export default function SlippageSetting(props: { className?: string }) {
  const { className } = props

  return (
    <Tooltip title={<SettingPanel />} disabledHover placement={'right-start'} className={tooltipClasses}>
      <button type={'button'} className={clsx('flex items-center gap-2 text-xs text-[#9E9E9E]', className)}>
        <img src={SettingSvg} alt={''} />
        <span>{'SLIPPAGE SETTINGS'}</span>
      </button>
    </Tooltip>
  )
}

const MAX = 19.99

function SettingPanel() {
  const [slippage, setSlippage] = useUserSlippageTolerance()
  const [slippageInput, setSlippageInput] = useState((slippage / 100).toFixed(2))

  function parseCustomSlippage(value: string) {
    setSlippageInput(value)

    try {
      const valueAsIntFromRoundedFloat = Number.parseInt(Math.round(Number.parseFloat(value) * 100).toString(), 10)
      if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < MAX * 100) {
        setSlippage(valueAsIntFromRoundedFloat)
      }
    } catch (e) {
      console.error(e)
      /* empty */
    }
  }

  return (
    <Tabs>
      <div className={'flex items-center gap-4'}>
        <span>{'Max.Slippage'}</span>
        <TabList
          className={'flex h-7 w-[130px] rounded border border-lemonYellow text-center text-xs text-lemonYellow'}
        >
          <Tab id={'auto'} className={tabClasses}>
            {'Auto'}
          </Tab>
          <Tab id={'custom'} className={tabClasses}>
            {'Custom'}
          </Tab>
        </TabList>
      </div>
      <TabPanel id={'auto'} className={tabPanelClasses}>
        <p className={'text-sm'}>{`${slippage / 100}%`}</p>
      </TabPanel>
      <TabPanel id={'custom'} className={tabPanelClasses}>
        <div className={'flex gap-4'}>
          <div className={'relative h-7 w-[70px] rounded-sm bg-[#0f0f0f]'}>
            <input
              type={'number'}
              value={slippageInput}
              min={0}
              max={MAX}
              className={'h-full w-full bg-transparent py-2 pl-2.5 pr-3 reset-input-number'}
              onBlur={() => parseCustomSlippage((slippage / 100).toFixed(2))}
              onChange={(e) => parseCustomSlippage(e.target.value)}
            />
            <span className={'absolute right-2.5 top-1/2 -translate-y-1/2'}>{'%'}</span>
          </div>
          <input
            type={'range'}
            className={'flex-1'}
            value={slippageInput}
            onChange={(e) => parseCustomSlippage(e.target.value)}
            min={0}
            step={0.01}
            max={MAX}
          />
        </div>
      </TabPanel>
    </Tabs>
  )
}
