import { enterInvitationCode } from '@/api'
import { PaxRewardRatio, PaxTableData, useFetchPaxInfo } from '@/api/get-pax-info'
import { useFetchPaxInvite } from '@/api/get-pax-invite'
import { ButtonPrimary } from '@/components/Button'
import OTP from '@/components/OTPInput'
import { useActiveWeb3React } from '@/hooks'
import copy from 'copy-to-clipboard'
import useENS from '@/hooks/useENS'
import { useWalletModalToggle } from '@/state/application/hooks'
import { useUserInfo } from '@/state/user/hooks'
import { shortenAddress } from '@/utils'
import clsx from 'clsx'
import { last } from 'lodash-es'
import { forwardRef, useState } from 'react'
import { Button, Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components'
import { toast } from 'react-toastify'
import { useMeasure } from 'react-use'
import Tooltip from '@/components/Tooltip'
import Clock from '@/components/Icons/Clock'

export default function PaxPage() {
  const [boxOneRef, { width: boxOneWidth }] = useMeasure<HTMLDivElement>()
  const [boxTwoRef, { width: boxTwoWidth }] = useMeasure<HTMLDivElement>()
  const { connector } = useActiveWeb3React()
  const [userInfo] = useUserInfo()
  const toggleWalletModal = useWalletModalToggle()
  const inviteData = useFetchPaxInvite()
  const infoData = useFetchPaxInfo()

  const handleWatchAsset = async () => {
    if (!userInfo) {
      toggleWalletModal()
      return
    }
    if (!connector || !infoData) return

    const options = {
      address: infoData.paxContract,
      symbol: 'PAX',
      decimals: 8,
    }
    const provider = await connector.getProvider()
    provider
      .request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options,
        },
      })
      .catch((e: any) => {
        toast.error(e?.message || 'Failed to watch asset')
        throw e
      })
      .then(() => {
        toast.success('Successfully added $PAX to your wallet')
      })
  }

  const handleCopy = () => {
    if (!userInfo || !userInfo.invitationCode) return
    const copied = copy(userInfo.invitationCode.toString())
    if (copied) {
      toast.success('Copied!')
    } else {
      toast.error('Failed to copy!')
    }
  }

  return (
    <div
      className={'py-8 px-16 flex flex-col gap-24'}
      style={{
        '--padding-left': `${boxOneWidth / 2 + 21}px`,
        '--padding-right': `${boxTwoWidth / 2 + 37}px`,
      }}
    >
      <Section>
        <H2>WHAT IS $PAX?</H2>
        <p className={'leading-8 mb-10'}>
          $PAX is the only token of PackEX Protocol, it's non- transferable and it's the only proof of profit-sharing
          from PackEX Protocol. It has no pre-sale, no solid maximum supply, 100 $PAX will be launched every day.
        </p>
        <div className={'flex border border-lemonYellow rounded p-8 items-center self-start'}>
          <span className={'text-lemonYellow mr-2'}>Contract: </span>
          <div className={'min-w-[500px] flex justify-center'}>
            <span
              className={clsx({
                loading: infoData?.paxContract === undefined,
              })}
            >
              {infoData?.paxContract}
            </span>
          </div>
          <ButtonPrimary className={'ml-7 w-[288px]'} onPress={handleWatchAsset}>
            +ADD $PAX TO YOUR WALLET
          </ButtonPrimary>
        </div>
      </Section>

      <Section>
        <H2>HOW TO MINT $PAX?</H2>
        <p className={'leading-8 mb-6'}>
          There're 4 different ways to mint $PAX (as there are more features on PackEX Protocol in the future, you will
          have more ways to mint $PAX):
        </p>
        <ul className={'leading-8'}>
          <li>1. Swap higher value on PackEX</li>
          <li>2. Liquidity added to the pools is traded at higher values</li>
          <li>3. Hold higher-value migrated assets</li>
          <li>4. Invite more users who can mint more $PAX</li>
        </ul>
      </Section>

      <Section>
        <H2>THE REWARDS FOR $PAX HOLDERS:</H2>
        <ul className={'leading-8'}>
          <li>1. Points, Gold and Blast tokens received from Blast network</li>
          <li>2. Gas fee earned from Blast network </li>
          <li>3. All the native yields for ETH and USDB that are belongs to PackEX</li>
          <li>4. Fees earned from all the liquidity pools</li>
          <li>5. Withdrawal fees earned from users (minus the portion spent)</li>
        </ul>
        <p className={'leading-8 mt-6'}>
          Since the team has distributed all the profits from PackEX Protocol to the $PAX holders and has not reserved
          or sold any tokens in advance, 5% of $PAX mined from each block will be allocated to the team in order to keep
          it on track.
        </p>
      </Section>

      <Section>
        <H2>$PAX MINTED</H2>
        <div className={'flex justify-center mb-2'}>
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
              {userInfo && infoData ? infoData.dailyRewards : '-'}
            </text>
          </svg>
        </div>
        <div aria-hidden className={'w-full mb-[47px] pl-[--padding-left] pr-[--padding-right]'}>
          <div aria-hidden className={'border-t-4 border-lemonYellow w-full'} />
        </div>
        <div className={'flex justify-between px-5'}>
          <div className={'flex-1'}>
            <div className={'flex gap-12'}>
              {(
                infoData?.paxRewardRatio ??
                Array.from({ length: 4 }, () => ({
                  name: '-',
                  ratio: '-',
                }))
              )
                .filter((_, index, array) => index !== array.length - 1)
                .map((item, index) => (
                  <div key={index} className={boxClasses} ref={boxOneRef}>
                    <span className={'text-xs mt-4'}>{item.name}</span>
                    <span className={'text-lemonYellow mt-8'}>[ {userInfo ? item.ratio : '-'} ]</span>
                  </div>
                ))}
            </div>
            <div className={'mt-10 border border-lemonYellow rounded py-8 px-[102px] text-lemonYellow'}>
              <p className={'flex gap-6'}>
                <span className={'w-[140px]'}>TOTAL MINTED</span>
                <span className={'text-[#9E9E9E]'}>{userInfo && inviteData ? inviteData.totalMinted : '-'}</span>
              </p>
              <p className={'flex gap-6 mt-8'}>
                <span className={'w-[140px]'}>UNCLAIMED</span>
                <span className={'text-[#9E9E9E]'}>{userInfo && inviteData ? inviteData.unclaimed : '-'}</span>
              </p>
              <p className="flex gap-3 items-center text-xs mt-8 text-white">
                <Clock className={'text-2xl'} />
                $PAX minted will be claimed automatically at 0:00 UTC every day.
              </p>
            </div>
          </div>
          <div className={'w-80 ml-6 flex flex-col'}>
            <SocialBox ref={boxTwoRef} data={last(infoData?.paxRewardRatio ?? [])} />
            <p className={'text-xs leading-[22px] pt-2 px-5'}>
              You can mint $PAX whenever your invites mint $PAX, or your invite's invites mint $PAX. The more they mint,
              the more you mint.
            </p>
          </div>
        </div>
        <div className={'flex gap-5 mt-[60px]'}>
          <div className={'border flex-1 border-lemonYellow rounded py-8 px-4 overflow-hidden'}>
            <h3 className={'text-lemonYellow'} id={'leaderboard-id'}>
              Leaderboard
            </h3>
            <MyTable data={infoData?.leaderBoard ?? []} />
          </div>

          <div className={'border flex-1 border-lemonYellow rounded py-8 px-4 overflow-hidden'}>
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
            <MyTable data={inviteData?.invite ?? []} />
          </div>
        </div>
      </Section>
    </div>
  )
}

const inputClasses = 'border border-lemonYellow rounded h-9 w-9 text-center bg-transparent'
const verticalLineClasses = clsx`
  before:absolute
  before:left-1/2
  before:-top-2
  before:-translate-y-full
  before:h-10
  before:px-2
  before:border-l-4
before:border-lemonYellow
`
const boxClasses = clsx(
  verticalLineClasses,
  'relative flex-1 border border-lemonYellow rounded flex flex-col items-center h-32',
)

function MyTable(props: { data: PaxTableData[] }) {
  const { data } = props

  return (
    <div className={'h-[600px] overflow-y-auto'}>
      <Table aria-labelledby={'invite-id'} className={'text-center w-full mt-6 [&_th]:px-4 [&_td]:px-4'}>
        <TableHeader className={'h-10 text-xs text-[#9E9E9E] bg-[--body-bg] sticky top-0 z-[1]'}>
          <Column>RANK</Column>
          <Column isRowHeader>NAME</Column>
          <Column>$PAX</Column>
        </TableHeader>
        <TableBody items={data} renderEmptyState={() => <p className={'mt-36 text-sm text-[#9e9e9e]'}>{'NO DATA'}</p>}>
          {(item) => (
            <Row id={item.rank} className={'h-[60px]'}>
              <Cell>{item.rank}</Cell>
              <Cell>
                <ShortenAddressOrENSName address={item.address} />
              </Cell>
              <Cell>
                <span title={item.totalAmount.toString()}>{item.totalAmount}</span>
              </Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function ShortenAddressOrENSName(props: { address: string }) {
  const { address } = props
  const { name } = useENS(address)
  if (name) return <span>{name}</span>
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
        {shortenAddress(address)}
      </Button>
    </Tooltip>
  )
}

const SocialBox = forwardRef<
  HTMLDivElement,
  {
    data: PaxRewardRatio | undefined
  }
>(function SocialBox(props, ref) {
  const { data } = props
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
      ref={ref}
      className={clsx(
        verticalLineClasses,
        userInfo?.invitationCode ? 'h-32 mb-20' : 'flex-1',
        'relative border border-lemonYellow px-5 py-4 rounded flex flex-col',
      )}
    >
      <span className={'self-center'}>{data?.name ?? 'SOCIAL'}</span>
      {userInfo?.invitationCode ? (
        <p className={'text-lemonYellow mt-8 text-center'}>[ {data?.ratio ?? '-'} ]</p>
      ) : (
        <>
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
          <p
            className={
              'w-full mt-[44px] border text-lemonYellow border-lemonYellow flex h-9 px-2 items-center justify-center self-center rounded-md text-xs'
            }
          >
            Enter Invite Code to mint $PAX
          </p>
          {!userInfo && (
            <>
              <span className={'self-center mt-8 text-[#FBFC02] text-xs'}>Already registered?</span>
              <Button className={'self-center mt-2 text-xs text-[#A4BAFF] underline'} onPress={toggleWalletModal}>
                Log in with your wallet
              </Button>
            </>
          )}
        </>
      )}
    </div>
  )
})

function Section({ children }: { children: React.ReactNode }) {
  return <section className={'flex flex-col'}>{children}</section>
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className={
        'text-[30px] mb-[52px] relative before:absolute before:h-1 before:w-20 before:bg-lemonYellow before:left-0 before:top-full before:translate-y-4'
      }
    >
      {children}
    </h2>
  )
}
