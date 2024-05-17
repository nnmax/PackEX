import { ButtonYellow, ButtonYellowLight } from '@/components/Button'
import DoubleCurrencyLogo from '@/components/DoubleLogo'
import clsx from 'clsx'
import { Button, Group, Input } from 'react-aria-components'
import { useMeasure } from 'react-use'

export default function PaxPage() {
  const [boxOneRef, { width: boxOneWidth }] = useMeasure<HTMLDivElement>()
  const [boxTwoRef, { width: boxTwoWidth }] = useMeasure<HTMLDivElement>()

  return (
    <div
      className={'py-8 px-16 flex flex-col gap-24'}
      style={{
        '--padding-left': `${boxOneWidth / 2 + 21}px`,
        '--padding-right': `${boxTwoWidth / 2 + 37}px`,
      }}
    >
      <section className={'flex flex-col gap-6'}>
        <h2 className={'text-[30px]'}>WHAT IS $PAX</h2>
        <p className={'leading-8'}>
          $PAX is the only token of PackEX Protocol, there is no solid maximum supply, but there is Burning-Economics to
          balance the total supply. We uphold the spirit of blockchain and follow the principle of fair launch. 14,400
          tokens will be mined in the first 30 days, then the number of tokens that will be mined per day in the next 30
          days is halved, and so on. When the number of tokens mined per day reaches 60, it will remain unchanged.
        </p>
        <div className={'flex border border-lemonYellow rounded p-8 items-center self-start'}>
          <span className={'text-lemonYellow mr-2'}>Contract: </span>
          <span>0x00000000000000000</span>
          <ButtonYellow className={'ml-7 w-full max-w-[288px]'}>+ADD $PAX TO YOUR WALLET</ButtonYellow>
        </div>
      </section>

      <section className={'flex flex-col gap-6'}>
        <h2 className={'text-[30px]'}>HOW TO MINT $PAX</h2>
        <p className={'leading-8'}>
          There're 4 different ways to mint $PAX (as there are more features on PackEX Protocol in the future, you will
          have more ways to mint $PAX):
        </p>
        <ul className={'leading-8'}>
          <li>1. Swap higher value on PackEX.</li>
          <li>2. Liquidity added to the pools is traded at higher values.</li>
          <li>3. Hold higher-value migrated assets.</li>
          <li>4. Invite more users who can mint more $PAX.</li>
        </ul>
        <h3 className={'text-lemonYellow text-[22px]'}>Note:</h3>
        <p className={'leading-8'}>
          We encourage using $PAX more to contribute to PackEX rather than leaving it idle, so as long as the $PAX
          balance of any non-contract address exceeds the value of $1,000, it will be burned 1/1000 by the contract
          automatically at 0:00 UTC everyday.
        </p>
      </section>

      <section className={'flex flex-col gap-6'}>
        <h2 className={'text-[30px]'}>The rewards of providing liquidity for $PAX:</h2>
        <ul className={'leading-8'}>
          <li>1. Points, Gold and Blast tokens received from Blast network</li>
          <li>2. All the native yields for ETH and USDB that are belongs to PackEX</li>
          <li>3. Fees earned in all liquidity pools</li>
          <li>4. New $PAX to be distributed</li>
        </ul>
        <p className={'leading-8'}>
          Since the team has distributed all profits from the PackEX Protocol to the users providing liquidity to $PAX
          and has not reserved or sold any tokens in advance, 1% of $PAX mined in each block will be allocated to the
          team in order to keep it on track.
        </p>
        <div className={'flex border border-lemonYellow rounded p-8 items-center self-start'}>
          <DoubleCurrencyLogo />
          <span>PAX / USDB</span>
          <ButtonYellow className={'ml-7 w-[180px]'}>+ADD LIQUIDITY</ButtonYellow>
        </div>
      </section>

      <section className={'flex flex-col gap-6'}>
        <h2 className={'text-[30px]'}>$PAX MINTED</h2>
        <ButtonYellow className={'w-full max-w-[180px]'} isDisabled>
          20500
        </ButtonYellow>
        <div aria-hidden className={'w-full mb-[23px] pl-[--padding-left] pr-[--padding-right]'}>
          <div aria-hidden className={'border-t-4 border-lemonYellow w-full'} />
        </div>
        <div className={'flex justify-between px-5'}>
          <div className={'flex-1'}>
            <div className={'flex gap-12'}>
              <div className={boxClasses} data-ratio={'1/6'} ref={boxOneRef}>
                <span className={'text-xs mt-4'}>SWAP</span>
                <span className={'text-lemonYellow mt-8'}>4100</span>
              </div>
              <div className={boxClasses} data-ratio={'1/2'}>
                <span className={'text-xs mt-4'}>POOL</span>
                <span className={'text-lemonYellow mt-8'}>4100</span>
              </div>
              <div className={boxClasses} data-ratio={'1/6'}>
                <span className={'text-xs mt-4'}>MIGRATED ASSETS </span>
                <span className={'text-lemonYellow mt-8'}>4100</span>
              </div>
            </div>
            <div className={'mt-10 border border-lemonYellow rounded py-8 px-[102px] text-lemonYellow'}>
              <p className={'flex gap-6'}>
                <span className={'w-20'}>Total</span>
                <span className={'text-[#9E9E9E]'}>0</span>
              </p>
              <p className={'flex gap-6 mt-8'}>
                <span className={'w-20'}>Unclaim</span>
                <span className={'text-[#9E9E9E]'}>0</span>
              </p>
              <ButtonYellow className={'w-20 mt-6 ml-[104px]'}>Claim</ButtonYellow>
            </div>
          </div>
          <div className={'w-80 ml-6'}>
            <div
              data-ratio={'1/6'}
              ref={boxTwoRef}
              className={clsx(
                verticalLineClasses,
                'relative border border-lemonYellow px-5 py-4 rounded flex flex-col',
              )}
            >
              <span className={'self-center'}>SOCIAL</span>
              <Group aria-label={'invite code'} className={'flex justify-between w-full mt-3'}>
                <Input className={inputClasses} maxLength={1} minLength={1} />
                <Input className={inputClasses} maxLength={1} minLength={1} />
                <Input className={inputClasses} maxLength={1} minLength={1} />
                <Input className={inputClasses} maxLength={1} minLength={1} />
                <Input className={inputClasses} maxLength={1} minLength={1} />
              </Group>
              <ButtonYellowLight className={'w-full mt-[44px]'} isDisabled>
                Enter Invite Code to mint $PAX
              </ButtonYellowLight>
              <span className={'self-center mt-8 text-[#FBFC02] text-xs'}>Already registered?</span>
              <Button className={'self-center mt-2 text-xs text-[#A4BAFF] underline'}>Log in with your wallet</Button>
            </div>
            <p className={'text-xs leading-[22px] pt-2 px-5'}>
              You can mint $PAX whenever your invites mint $PAX, or your invite's invites mint $PAX. The more they mint,
              the more you mint.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

const inputClasses = 'border border-lemonYellow rounded h-9 w-9 text-center bg-[#6F6F6F]'
const verticalLineClasses = clsx`
  before:content-[attr(data-ratio)]
  before:absolute
  before:left-1/2
  before:-top-2
  before:-translate-y-full
  before:h-10
  before:px-2
  before:text-sm
  before:text-lemonYellow
  before:leading-10
  before:border-l-4
before:border-lemonYellow
`
const boxClasses = clsx(
  verticalLineClasses,
  'relative flex-1 border border-lemonYellow rounded flex flex-col items-center h-32',
)
