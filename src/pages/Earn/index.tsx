import copy from 'copy-to-clipboard'
import clsx from 'clsx'
import { last } from 'lodash-es'
import { forwardRef, useMemo, useState } from 'react'
import { Button, Cell, Column, Heading, Row, Table, TableBody, TableHeader } from 'react-aria-components'
import { toast } from 'react-toastify'
import { useMeasure } from 'react-use'
import { useQueryClient } from '@tanstack/react-query'
import { usePaxInvite } from '@/api/get-pax-invite'
import { useUserInfo } from '@/api/get-user'
import { useWalletModalToggle } from '@/state/application/hooks'
import useENS from '@/hooks/useENS'
import OTP from '@/components/OTPInput'
import { usePaxInfo } from '@/api/get-pax-info'
import { enterInvitationCode } from '@/api'
import ShortenAddressCopy from '@/components/ShortenAddressCopy'
import Diamond1Svg from '@/assets/images/diamond-1.svg'
import Diamond3Svg from '@/assets/images/diamond-3.svg'
import Modal from '@/components/Modal'
import CurrencyLogo from '@/components/CurrencyLogo'
import useDocumentTitle from '@/hooks/useDocumentTitle'
import Tooltip from '@/components/Tooltip'
import type { GetUserData } from '@/api/get-user'
import type { Bonus } from '@/api/get-pax-invite'
import type { PaxRewardRatio, PaxTableData } from '@/api/get-pax-info'

export default function EarnPage() {
  const [boxOneRef, { width: boxOneWidth }] = useMeasure<HTMLDivElement>()
  const [boxTwoRef, { width: boxTwoWidth }] = useMeasure<HTMLDivElement>()
  useDocumentTitle('Earn')
  const { data: userInfo } = useUserInfo()
  const { data: inviteData } = usePaxInvite()
  const { data: infoData } = usePaxInfo()
  const [bonusModalType, setBonusModalType] = useState<'week' | 'total'>('week')
  const [bonusModalOpen, setBonusModalOpen] = useState(false)

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
      className={'py-8 px-16 flex flex-col gap-[60px]'}
      style={{
        '--padding-left': `${boxOneWidth / 2 + 1}px`,
        '--padding-right': `${boxTwoWidth / 2 + 31}px`,
      }}
    >
      <BonusModal
        isOpen={bonusModalOpen}
        type={bonusModalType}
        dataList={bonusModalType === 'week' ? inviteData?.dailyBonusList : inviteData?.totalBonusList}
        onClose={() => {
          setBonusModalOpen(false)
        }}
      />
      <Section>
        <H2>{'HOW TO GET REWARDS ON PACKEX PROTOCOL ?'}</H2>
        <p className={'leading-8 mb-6'}>
          {
            "Almost all rewards will be distributed to the contributors of PackEX, and there're 4 different ways to contribute to PackEX (as there are more features on PackEX in the future, you will have more ways to get rewards):"
          }
        </p>
        <ul className={'leading-8'}>
          <li>{'1. Swap higher value on PackEX'}</li>
          <li>{'2. Liquidity added to the pools is traded at higher values'}</li>
          <li>{'3. Hold higher-value migrated assets'}</li>
          <li>{'4. Invite more users who can get more rewards on PackEX'}</li>
        </ul>
      </Section>

      <Section>
        <H2>{'REWARDS FOR ALL CONTRIBUTORS:'}</H2>
        <ul className={'leading-8'}>
          <li>{'1. Blast Points & Blast Gold received from Blast network'}</li>
          <li>{'2. Gas fee earned from Blast network'}</li>
          <li>{'3. All the native yields for ETH and USDB that are belongs to PackEX'}</li>
          <li>{'4. Fees earned from all the liquidity pools'}</li>
        </ul>
        <p className={'leading-8 mt-6'}>
          {
            'PackEX distributes 95% of the revenue to all contributors in proportion to their contributions, leaving only 5% for itself to make it on track. The rewards are calculated separately every day and distributed once a week.'
          }
        </p>
      </Section>

      <Section>
        <div className={'flex justify-center mb-2'}>
          <h2 className={'h-11 rounded-md bg-lemonYellow text-black text-sm/[44px] px-5'}>
            {'THE CONTRIBUTIONS BELOW WILL BE REWARDED'}
          </h2>
        </div>
        <div aria-hidden className={'w-full mb-[47px] pl-[--padding-left] pr-[--padding-right]'}>
          <div aria-hidden className={'border-t-4 border-lemonYellow w-full'} />
        </div>
        <div className={'flex justify-between'}>
          <div className={'flex-1'}>
            <div className={'flex gap-9'}>
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
                    <span className={'text-lemonYellow mt-8'}>
                      {'[ '}
                      {userInfo ? item.ratio : '-'}
                      {' ]'}
                    </span>
                  </div>
                ))}
            </div>
            <div
              className={
                'mt-10 flex flex-col gap-10 border border-lemonYellow rounded py-24 items-center text-lemonYellow'
              }
            >
              <p className={'flex gap-7 items-center'}>
                <span className={'w-[246px]'}>{'REWARDS UNDISTRIBUTED:'}</span>
                <Button
                  aria-label={'Click to show REWARDS UNDISTRIBUTED'}
                  onPress={() => {
                    setBonusModalType('week')
                    setBonusModalOpen(true)
                  }}
                >
                  <img src={Diamond1Svg} alt={''} />
                </Button>
              </p>
              <p className={'flex gap-7 items-center'}>
                <span className={'w-[246px]'}>{'REWARDS DISTRIBUTED:'}</span>
                <Button
                  aria-label={'Click to show REWARDS DISTRIBUTED:'}
                  onPress={() => {
                    setBonusModalType('total')
                    setBonusModalOpen(true)
                  }}
                >
                  <img src={Diamond3Svg} alt={''} />
                </Button>
              </p>
            </div>
          </div>
          <div className={'flex-[0_0_23rem] ml-10 flex flex-col gap-10'}>
            <SocialBox ref={boxTwoRef} data={last(infoData?.paxRewardRatio ?? [])} />
            {userInfo?.invitationCode && (
              <div className={'border border-lemonYellow rounded flex-auto px-10 flex items-center'}>
                <SocialText />
              </div>
            )}
          </div>
        </div>
        <div className={'flex gap-5 mt-[60px]'}>
          <div className={'border flex-1 border-lemonYellow rounded py-8 px-4 overflow-hidden'}>
            <h3 className={'text-lemonYellow'} id={'leaderboard-id'}>
              {'LEADERBOARD THIS WEEK'}
            </h3>
            <MyTable labelledby={'leaderboard-id'} data={infoData?.leaderBoard ?? []} yourData={inviteData?.userPax} />
          </div>

          <div className={'border flex-1 border-lemonYellow rounded py-8 px-4 overflow-hidden'}>
            <div className={'flex justify-between'}>
              <h3 className={'text-lemonYellow'} id={'invite-id'}>
                {'INVITE THIS WEEK'}
              </h3>
              {!!userInfo && userInfo.invitationCode && (
                <div className={'flex text-lemonYellow gap-4 items-center'}>
                  <span className={'text-xs'}>{'INVITE CODE: '}</span>
                  <span>{userInfo.invitationCode}</span>
                  <Tooltip title={'Copy your code'}>
                    <Button aria-label={'Copy'} onPress={handleCopy}>
                      <span className={'icon-[pixelarticons--copy]'} aria-hidden />
                    </Button>
                  </Tooltip>
                </div>
              )}
            </div>
            <MyTable labelledby={'invite-id'} data={inviteData?.inviteList ?? []} />
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

const YOU = 'YOU'

function MyTable(props: { data: PaxTableData[]; yourData?: PaxTableData; labelledby: string }) {
  const { data, yourData, labelledby } = props

  type TableData = PaxTableData & { highlight?: boolean }

  const tableData: TableData[] = useMemo(() => {
    if (yourData) {
      return [{ ...yourData, highlight: true, address: YOU }, ...data]
    }
    return data
  }, [data, yourData])

  return (
    <div className={'h-[600px] overflow-y-auto'}>
      <Table aria-labelledby={labelledby} className={'text-center w-full mt-6 [&_th]:px-4 [&_td]:px-4'}>
        <TableHeader className={'h-10 text-xs text-[#9E9E9E] bg-[--body-bg] sticky top-0 z-[1]'}>
          <Column>{'RANK'}</Column>
          <Column isRowHeader>{'NAME'}</Column>
          <Column>{'CONTRIBUTION'}</Column>
        </TableHeader>
        <TableBody
          items={tableData}
          renderEmptyState={() => <p className={'mt-36 text-sm text-[#9e9e9e]'}>{'NO DATA'}</p>}
        >
          {(item) => (
            <Row id={item.id} className={clsx('h-[60px]', item.highlight && 'text-lemonYellow')}>
              <Cell>{item.rank}</Cell>
              <Cell>{item.address === YOU ? YOU : <ShortenAddressOrENSName address={item.address} />}</Cell>
              <Cell>
                <span>
                  {item.address === YOU
                    ? item.totalAmount
                      ? item.totalAmount.toFixed(2) + '%'
                      : '-'
                    : item.totalAmount.toFixed(2) + '%'}
                </span>
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
        'relative border border-lemonYellow px-[34px] py-4 rounded flex flex-col',
      )}
    >
      <span className={'self-center text-xs'}>
        {data?.name} <span className={'text-lemonYellow'}>{!userInfo?.invitationCode && `[ ${data?.ratio} ]`}</span>
      </span>
      {userInfo?.invitationCode ? (
        <p className={'text-lemonYellow mt-8 text-center'}>
          {'[ '}
          {data?.ratio ?? '-'}
          {' ]'}
        </p>
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
            <span className={'text-xs text-[#FF3535] absolute self-center top-[100px]'}>{'Invalid invite code.'}</span>
          )}
          <p
            className={
              'w-full mt-[44px] border text-lemonYellow border-lemonYellow flex h-9 px-2 items-center justify-center self-center rounded-md text-xs'
            }
          >
            {'Enter Invite Code To Get Rewards'}
          </p>
          {!userInfo && (
            <>
              <span className={'self-center mt-8 text-[#FBFC02] text-xs'}>{'Already registered?'}</span>
              <Button className={'self-center mt-2 text-xs text-[#A4BAFF] underline'} onPress={toggleWalletModal}>
                {'Log in with your wallet'}
              </Button>
            </>
          )}
          <div className={'flex items-center flex-1'}>
            <SocialText />
          </div>
        </>
      )}
    </div>
  )
})

function SocialText() {
  return (
    <p className={'text-xs leading-8'}>
      {
        'As long as the people you invite get more rewards, or the people they invite get more rewards, you get more rewards. The more they get, the more you get.'
      }
    </p>
  )
}

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

function BonusModal(props: {
  type: 'week' | 'total'
  onClose: () => void
  dataList: Bonus[] | undefined
  isOpen: boolean
}) {
  const { type, onClose, dataList, isOpen } = props

  const title =
    type === 'week' ? (
      <>
        <img src={Diamond1Svg} alt={''} />
        <span>{'REWARDS UNDISTRIBUTED'}</span>
      </>
    ) : (
      <>
        <img src={Diamond3Svg} alt={''} />
        <span>{'REWARDS DISTRIBUTED'}</span>
      </>
    )

  return (
    <Modal padding={'24px 50px 48px'} maxWidth={'400px'} isOpen={isOpen} onClose={onClose} showRhombus={false}>
      <Heading slot={'title'} className={'flex flex-col gap-5 items-center mb-6'}>
        {title}
      </Heading>
      <ul className={'flex flex-col gap-2'}>
        {(!dataList || dataList?.length === 0) && <li className={'text-center text-[#9E9E9E]'}>{'NO DATA'}</li>}
        {dataList?.map((item) => (
          <li key={item.symbol} className={'w-full gap-4 p-4 rounded-md bg-black flex items-center'}>
            <CurrencyLogo src={item.logoUri} size={'40px'} />
            <div className={'flex flex-col text-sm min-w-0'}>
              <span className={'text-[#B5B5B5]'}>{item.symbol}</span>
              <Tooltip title={item.bonusAmount}>
                <p className={'truncate'}>{item.bonusAmount}</p>
              </Tooltip>
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
