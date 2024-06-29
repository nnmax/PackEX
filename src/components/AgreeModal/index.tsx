import useAgree from '@/api/agree'
import { useUserInfo } from '@/api/get-user'
import AriaModal from '@/components/AriaModal'
import { ButtonPrimary } from '@/components/Button'
import LogoBox from '@/components/Icons/LogoBox'
import { useEffect, useState } from 'react'
import { Heading } from 'react-aria-components'

function useAgreedLogic() {
  const { data: userInfo } = useUserInfo()
  const [agreed, _setAgree] = useState(true)
  const { mutateAsync: agreeAsync, isPending } = useAgree()

  useEffect(() => {
    if (!userInfo || userInfo.agreed) {
      _setAgree(true)
      return
    }
    _setAgree(false)
  }, [userInfo])

  const setAgreed = async () => {
    if (!userInfo || userInfo.agreed) return
    await agreeAsync()
    _setAgree(true)
  }

  return [agreed, isPending, setAgreed] as const
}

export default function AgreeModal() {
  const [agreed, agreeing, setAgreed] = useAgreedLogic()

  return (
    <AriaModal
      maxWidth={'960px'}
      isOpen={!agreed}
      isKeyboardDismissDisabled
      showCloseButton={false}
      isDismissable={false}
      showRhombus={false}
    >
      <div className={'flex flex-col relative items-center px-[72px] pb-7 pt-12'}>
        <div className={'flex absolute items-center top-0 right-8 gap-2'}>
          <LogoBox width={'20'} height={'20'} />
          <span className={'text-[18px] text-lemonYellow'}>PACKEX</span>
        </div>
        <Heading slot="title" className="self-start">
          Welcome to PackEX Protocol!
        </Heading>
        <p className={'text-xs mt-10 leading-8'}>
          Before using PackEX Protocol's frontend interface, users are required to thoroughly review the announcement.
          The Web provided by PackEX Protocol merely facilitates access to decentralized smart contracts on the Blast
          Network and does not bear liability for the smart contracts' functionality or reliability. Engaging with our
          frontend or directly with the smart contracts is at the user's discretion and risk. PackEX Protocol does not
          oversee or ensure the performance of the underlying smart contract technology.
        </p>
        <ButtonPrimary isLoading={agreeing} onPress={setAgreed} className={'max-w-[280px] w-full mt-14'}>
          Agree and Continue
        </ButtonPrimary>
      </div>
    </AriaModal>
  )
}
