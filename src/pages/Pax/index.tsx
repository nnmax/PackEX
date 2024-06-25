import { enterInvitationCode } from '@/api'
import { PaxRewardRatio, PaxTableData, usePaxInfo } from '@/api/get-pax-info'
import { ButtonPrimary } from '@/components/Button'
import OTP from '@/components/OTPInput'
import copy from 'copy-to-clipboard'
import useENS from '@/hooks/useENS'
import { useWalletModalToggle } from '@/state/application/hooks'
import clsx from 'clsx'
import { last } from 'lodash-es'
import { forwardRef, useMemo, useState } from 'react'
import { Button, Cell, Column, Heading, Row, Table, TableBody, TableHeader } from 'react-aria-components'
import { toast } from 'react-toastify'
import { useMeasure } from 'react-use'
import { useChainId, useConnectorClient, useSwitchChain } from 'wagmi'
import { watchAsset } from 'viem/actions'
import useIsSupportedChainId from '@/hooks/useIsSupportedChainId'
import { Bonus, usePaxInvite } from '@/api/get-pax-invite'
import { GetUserData, useUserInfo } from '@/api/get-user'
import { useQueryClient } from '@tanstack/react-query'
import ShortenAddressCopy from '@/components/ShortenAddressCopy'
import Diamond1Svg from '@/assets/images/diamond-1.svg'
import Diamond3Svg from '@/assets/images/diamond-3.svg'
import AriaModal from '@/components/AriaModal'
import CurrencyLogo from '@/components/CurrencyLogo'
import useDocumentTitle from '@/hooks/useDocumentTitle'

export default function PaxPage() {
  const [boxOneRef, { width: boxOneWidth }] = useMeasure<HTMLDivElement>()
  const [boxTwoRef, { width: boxTwoWidth }] = useMeasure<HTMLDivElement>()
  const { data: connectorClient } = useConnectorClient()
  const isSupportedChainId = useIsSupportedChainId()
  useDocumentTitle('PAX')
  const { data: userInfo } = useUserInfo()
  const toggleWalletModal = useWalletModalToggle()
  const { data: inviteData } = usePaxInvite()
  const { data: infoData } = usePaxInfo()
  const { switchChain } = useSwitchChain()
  const chainId = useChainId()
  const [watchingAsset, setWatchingAsset] = useState(false)
  const [showBonusModalType, setShowBonusModalType] = useState<'daily' | 'total' | null>(null)

  const handleWatchAsset = async () => {
    if (!userInfo) {
      toggleWalletModal()
      return
    }

    if (!connectorClient || !infoData) return

    setWatchingAsset(true)

    try {
      if (!isSupportedChainId) {
        await switchChain({
          chainId,
        })
      }

      watchAsset(connectorClient, {
        type: 'ERC20',
        options: {
          address: infoData.paxContract,
          symbol: 'PAX',
          decimals: 8,
        },
      }).then(() => {
        toast.success('Successfully added $PAX to your wallet')
      })
    } catch (error) {
      console.error(error)
    } finally {
      setWatchingAsset(false)
    }
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
      <BonusModal
        type={showBonusModalType}
        dataList={showBonusModalType === 'daily' ? inviteData?.dailyBonusList : inviteData?.totalBonusList}
        onClose={() => {
          setShowBonusModalType(null)
        }}
      />
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
          <ButtonPrimary className={'ml-7 w-[288px]'} onPress={handleWatchAsset} isLoading={watchingAsset}>
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
          <li>1. Blast tokens received from Blast network</li>
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
        <H2>PAX MINTED</H2>
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
            <div
              className={'mt-10 flex flex-col gap-6 border border-lemonYellow rounded py-8 px-[102px] text-lemonYellow'}
            >
              <p className={'flex gap-6 items-center'}>
                <span className={'w-[200px]'}>TOTAL PAX MINTED</span>
                <span className={'text-[#9E9E9E]'}>{userInfo && inviteData ? inviteData.totalMinted : '-'}</span>
              </p>
              <p className={'flex gap-6 items-center'}>
                <span className={'w-[200px]'}>PAX MINTED TODAY</span>
                <span className={'text-[#9E9E9E]'}>{userInfo && inviteData ? inviteData.unclaimed : '-'}</span>
              </p>
              <p className={'flex gap-6 items-center'}>
                <span className={'w-[200px]'}>DAILY BONUS</span>
                <Button aria-label="Click to show daily bonus" onPress={() => setShowBonusModalType('daily')}>
                  <img src={Diamond1Svg} alt="" />
                </Button>
              </p>
              <p className={'flex gap-6 items-center'}>
                <span className={'w-[200px]'}>TOTAL BONUS</span>
                <Button aria-label="Click to show total bonus" onPress={() => setShowBonusModalType('total')}>
                  <img src={Diamond3Svg} alt="" />
                </Button>
              </p>
            </div>
          </div>
          <div className={'w-80 ml-6 flex flex-col gap-10'}>
            <SocialBox ref={boxTwoRef} data={last(infoData?.paxRewardRatio ?? [])} />
            {userInfo?.invitationCode && (
              <div className="border border-lemonYellow rounded flex-auto px-10 flex items-center">
                <p className={'text-xs leading-8'}>
                  You can mint $PAX whenever your invites mint $PAX, or your invite's invites mint $PAX. The more they
                  mint, the more you mint.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className={'flex gap-5 mt-[60px]'}>
          <div className={'border flex-1 border-lemonYellow rounded py-8 px-4 overflow-hidden'}>
            <h3 className={'text-lemonYellow'} id={'leaderboard-id'}>
              Leaderboard
            </h3>
            <MyTable data={infoData?.leaderBoard ?? []} yourData={inviteData?.userPax} />
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
            <MyTable data={inviteData?.inviteList ?? []} />
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

function MyTable(props: { data: PaxTableData[]; yourData?: PaxTableData }) {
  const { data, yourData } = props

  type TableData = PaxTableData & { highlight?: boolean }

  const tableData: TableData[] = useMemo(() => {
    if (yourData) {
      return [{ ...yourData, highlight: true, address: 'YOU' }, ...data]
    }
    return data
  }, [data, yourData])

  return (
    <div className={'h-[600px] overflow-y-auto'}>
      <Table aria-labelledby={'invite-id'} className={'text-center w-full mt-6 [&_th]:px-4 [&_td]:px-4'}>
        <TableHeader className={'h-10 text-xs text-[#9E9E9E] bg-[--body-bg] sticky top-0 z-[1]'}>
          <Column>RANK</Column>
          <Column isRowHeader>NAME</Column>
          <Column>PAX</Column>
        </TableHeader>
        <TableBody
          items={tableData}
          renderEmptyState={() => <p className={'mt-36 text-sm text-[#9e9e9e]'}>{'NO DATA'}</p>}
        >
          {(item) => (
            <Row id={item.id} className={clsx('h-[60px]', item.highlight && 'text-lemonYellow')}>
              <Cell>{item.rank}</Cell>
              <Cell>
                {item.address.toLowerCase() === 'you' ? 'YOU' : <ShortenAddressOrENSName address={item.address} />}
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
  return <ShortenAddressCopy address={address} />
}

const SocialBox = forwardRef<
  HTMLDivElement,
  {
    data: PaxRewardRatio | undefined
  }
>(function SocialBox(props, ref) {
  const { data } = props
  const { data: userInfo } = useUserInfo()
  const queryClient = useQueryClient()
  const toggleWalletModal = useWalletModalToggle()
  const [loading, setLoading] = useState(false)
  const [invalid, setInvalid] = useState(false)

  const handleChange = (value: string) => {
    if (!userInfo) return
    setLoading(true)
    enterInvitationCode(value)
      .then((res) => {
        queryClient.setQueryData<GetUserData | undefined>(['get-current-login-user'], (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            invitationCode: res?.invitationCode,
          }
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
        userInfo?.invitationCode ? 'h-32' : 'flex-1',
        'relative border border-lemonYellow px-5 py-4 rounded flex flex-col',
      )}
    >
      <span className={'self-center text-xs'}>
        {data?.name} <span className="text-lemonYellow">{!userInfo?.invitationCode && `[ ${data?.ratio} ]`}</span>
      </span>
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
          <div className="flex items-center flex-1">
            <p className={'text-xs leading-8'}>
              You can mint $PAX whenever your invites mint $PAX, or your invite's invites mint $PAX. The more they mint,
              the more you mint.
            </p>
          </div>
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

function BonusModal(props: { type: 'daily' | 'total' | null; onClose: () => void; dataList: Bonus[] | undefined }) {
  const { type, onClose, dataList } = props

  const open = !!type

  const title =
    type === 'daily' ? (
      <>
        <img src={Diamond1Svg} alt="" />
        <span>DAILY BONUS</span>
      </>
    ) : (
      <>
        <img src={Diamond3Svg} alt="" />
        <span>TOTAL BONUS</span>
      </>
    )

  return (
    <AriaModal padding="44px 40px" maxWidth={'360px'} isOpen={open} onClose={onClose} showRhombus={false}>
      <Heading slot="title" className={'flex gap-4 items-center justify-center mb-6'}>
        {title}
      </Heading>
      <ul className={'flex flex-col gap-2'}>
        {(!dataList || dataList?.length === 0) && <li className={'text-center text-[#9E9E9E]'}>NO DATA</li>}
        {dataList?.map((item) => (
          <li key={item.id} className={'w-full gap-4 p-4 rounded-md bg-black flex items-center'}>
            <CurrencyLogo src={item.logoUri} size="40px" />
            <div className="flex flex-col text-sm">
              <span className={'text-[#B5B5B5]'}>{item.symbol}</span>
              <span>{item.bonusAmount}</span>
            </div>
          </li>
        ))}
      </ul>
    </AriaModal>
  )
}
