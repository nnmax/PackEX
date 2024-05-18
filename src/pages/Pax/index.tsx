import { enterInvitationCode } from '@/api'
import { ButtonYellow, ButtonYellowLight } from '@/components/Button'
import DoubleCurrencyLogo from '@/components/DoubleLogo'
import OTP from '@/components/OTPInput'
import { useActiveWeb3React } from '@/hooks'
import { useWalletModalToggle } from '@/state/application/hooks'
import { useUserInfo } from '@/state/user/hooks'
import clsx from 'clsx'
import { forwardRef, useState } from 'react'
import { Button, Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useMeasure } from 'react-use'

const leaderboards = Array.from({ length: 20 }, (_, i) => ({
  rank: i + 1,
  name: 'User ' + i,
  totalMinted: i * 100,
}))

export default function PaxPage() {
  const [boxOneRef, { width: boxOneWidth }] = useMeasure<HTMLDivElement>()
  const [boxTwoRef, { width: boxTwoWidth }] = useMeasure<HTMLDivElement>()
  const { library } = useActiveWeb3React()
  const [userInfo] = useUserInfo()
  const toggleWalletModal = useWalletModalToggle()

  const handleWatchAsset = () => {
    if (!userInfo) {
      toggleWalletModal()
      return
    }
    if (!library) return
    // TODO
    // library.send('wallet_watchAsset', [
    //   {
    //     type: 'ERC20',
    //     options: {
    //       address: '0x00000000000000000',
    //       symbol: 'PAX',
    //       decimals: 18,
    //       image: 'https://packex.io/favicon.ico',
    //     },
    //   },
    // ])
  }

  const handleAdd = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (!userInfo) {
      event.preventDefault()
      toggleWalletModal()
    }
  }

  const handleCopy = () => {
    if (!userInfo || !userInfo.invitationCode) return

    navigator.clipboard
      .writeText(userInfo.invitationCode.toString())
      .then(() => {
        toast.success('Copied!')
      })
      .catch(() => {
        toast.error('Failed to copy!')
      })
  }

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
          <ButtonYellow className={'ml-7 w-full max-w-[288px]'} onPress={handleWatchAsset}>
            +ADD $PAX TO YOUR WALLET
          </ButtonYellow>
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
          <Link
            // TODO: currencyIdA 和 currencyIdB 替换成对应的 address
            to={'/pool/add/:currencyIdA/:currencyIdB'}
            onClick={handleAdd}
            className={
              'ml-7 w-[180px] bg-lemonYellow text-[#020202] flex h-9 px-2 items-center justify-center self-center rounded-md text-xs'
            }
          >
            +ADD LIQUIDITY
          </Link>
        </div>
      </section>

      <section className={'flex flex-col gap-6'}>
        <h2 className={'text-[30px]'}>$PAX MINTED</h2>
        <div className={'flex justify-center -mb-4'}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            version="1.1"
            width="280"
            height="44"
            viewBox="0 0 280 44"
          >
            <g transform="matrix(-1,0,0,-1,392,88)">
              <path
                d="M202.88628,79.78739999999999C200.15794,83.0412,202.47132,88,206.7176,88L387,88C389.76099999999997,88,392,85.76140000000001,392,83L392,49C392,46.23858,389.76099999999997,44,387,44L235.2267,44C233.7481,44,232.34539999999998,44.654416,231.3954,45.7874L202.88628,79.78739999999999Z"
                fill="#FFC300"
                fillOpacity="1"
              />
            </g>
            <path
              d="M178.01618,35.9958C175.53917,39.2914,177.89042,44,182.0131,44L275,44C277.76099999999997,44,280,41.7614,280,39L280,5C280,2.23858,277.76099999999997,0,275,0L207.5685,0C205.9966,0,204.5161,0.739252,203.5716,1.99583L178.01618,35.9958ZM178.81556,36.5967Q178.09422,37.5564,178.01351,38.7068Q177.93739,39.7917,178.43441,40.787Q178.93143,41.7823,179.84439,42.3733Q180.81249,43,182.0131,43L275,43Q276.657,43,277.828,41.8284Q279,40.6569,279,39L279,5Q279,3.34315,277.828,2.17157Q276.657,1,275,1L207.5685,1Q205.5711,1,204.371,2.59666L178.81556,36.5967Z"
              fillRule="evenodd"
              fill="#FFC300"
              fillOpacity="1"
            />

            <text x="20" y="28" fill="#000" fontSize="14">
              DAILY REWARDS
            </text>
            <text x="215" y="28" fill="#FFC300" fontSize="16">
              410
            </text>
          </svg>
        </div>
        <div aria-hidden className={'w-full mb-[23px] pl-[--padding-left] pr-[--padding-right]'}>
          <div aria-hidden className={'border-t-4 border-lemonYellow w-full'} />
        </div>
        <div className={'flex justify-between px-5'}>
          <div className={'flex-1'}>
            <div className={'flex gap-12'}>
              <div className={boxClasses} data-ratio={'1/6'} ref={boxOneRef}>
                <span className={'text-xs mt-4'}>SWAP</span>
                <span className={'text-lemonYellow mt-8'}>[ 4100 ]</span>
              </div>
              <div className={boxClasses} data-ratio={'1/2'}>
                <span className={'text-xs mt-4'}>POOL</span>
                <span className={'text-lemonYellow mt-8'}>[ 4100 ]</span>
              </div>
              <div className={boxClasses} data-ratio={'1/6'}>
                <span className={'text-xs mt-4'}>MIGRATED ASSETS </span>
                <span className={'text-lemonYellow mt-8'}>[ 4100 ]</span>
              </div>
            </div>
            <div className={'mt-10 border border-lemonYellow rounded py-8 px-[102px] text-lemonYellow'}>
              <p className={'flex gap-6'}>
                <span className={'w-[140px]'}>TOTAL MINTED</span>
                <span className={'text-[#9E9E9E]'}>0</span>
              </p>
              <p className={'flex gap-6 mt-8'}>
                <span className={'w-[140px]'}>Unclaim</span>
                <span className={'text-[#9E9E9E]'}>0</span>
              </p>
              <ButtonYellow className={'w-20 mt-6 ml-[164px]'}>Claim</ButtonYellow>
            </div>
          </div>
          <div className={'w-80 ml-6'}>
            <SocialBox ref={boxTwoRef} />
            <p className={'text-xs leading-[22px] pt-2 px-5'}>
              You can mint $PAX whenever your invites mint $PAX, or your invite's invites mint $PAX. The more they mint,
              the more you mint.
            </p>
          </div>
        </div>
        <div className={'flex gap-5'}>
          <div className={'border flex-1 border-lemonYellow rounded py-8 px-4'}>
            <h3 className={'text-lemonYellow'} id={'leaderboard-id'}>
              Leaderboard
            </h3>
            <MyTable />
          </div>

          <div className={'border flex-1 border-lemonYellow rounded py-8 px-4'}>
            <div className={'flex justify-between'}>
              <h3 className={'text-lemonYellow'} id={'invite-id'}>
                Invite
              </h3>
              {!!userInfo && userInfo.invitationCode && (
                <div className={'flex text-lemonYellow gap-4 items-center'}>
                  <span className={'text-xs'}>Invite Code:</span>
                  <span>{userInfo.invitationCode}</span>
                  <Button aria-label={'Copy'} onPress={handleCopy}>
                    <span className={'icon-[pixelarticons--copy]'} aria-hidden />
                  </Button>
                </div>
              )}
            </div>
            <MyTable />
          </div>
        </div>
      </section>
    </div>
  )
}

const inputClasses = 'border border-lemonYellow rounded h-9 w-9 text-center bg-transparent'
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

function MyTable() {
  return (
    <div className={'h-[600px] overflow-y-auto'}>
      <Table aria-labelledby={'invite-id'} className={'text-center w-full mt-6'}>
        <TableHeader className={'h-10 text-xs text-[#9E9E9E] bg-[--body-bg] sticky top-0 z-[1]'}>
          <Column>RANK</Column>
          <Column>NAME</Column>
          <Column isRowHeader>TOTAL $PAX MINTED</Column>
        </TableHeader>
        <TableBody items={leaderboards}>
          {(item) => (
            <Row id={item.rank} className={'h-[60px]'}>
              <Cell>{item.rank}</Cell>
              <Cell>{item.name}</Cell>
              <Cell>{item.totalMinted}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

const SocialBox = forwardRef<HTMLDivElement>(function SocialBox(props, ref) {
  const [userInfo, updateUserInfo] = useUserInfo()
  const toggleWalletModal = useWalletModalToggle()
  const [loading, setLoading] = useState(false)
  const [invalid, setInvalid] = useState(false)

  const handleChange = (value: string) => {
    if (!userInfo) return
    setLoading(true)
    enterInvitationCode(value)
      .then((res) => {
        updateUserInfo({
          ...userInfo,
          invitationCode: res,
        })
      })
      .catch(() => {
        setInvalid(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div
      data-ratio={'1/6'}
      ref={ref}
      className={clsx(verticalLineClasses, 'relative border border-lemonYellow px-5 py-4 rounded flex flex-col')}
    >
      <span className={'self-center'}>SOCIAL</span>
      <OTP
        loading={loading}
        formatter={(value) => value.toUpperCase()}
        length={5}
        aria-label={'invite code'}
        className={'flex justify-between w-full mt-3'}
        inputClassName={clsx(inputClasses, !userInfo && '!bg-[#6F6F6F]')}
        disabled={!userInfo}
        onChange={handleChange}
      />
      {invalid && (
        <span className={'text-xs text-[#FF3535] absolute self-center top-[100px]'}>Invalid invite code.</span>
      )}
      <ButtonYellowLight className={'w-full mt-[44px]'} isDisabled>
        Enter Invite Code to mint $PAX
      </ButtonYellowLight>
      {!userInfo && (
        <>
          <span className={'self-center mt-8 text-[#FBFC02] text-xs'}>Already registered?</span>
          <Button className={'self-center mt-2 text-xs text-[#A4BAFF] underline'} onPress={toggleWalletModal}>
            Log in with your wallet
          </Button>
        </>
      )}
    </div>
  )
})
