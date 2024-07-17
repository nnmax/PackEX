import fetcher from '@/utils/fetcher'

export interface EnterInvitationCodeData {
  invitationCode: string
}

export default function enterInvitationCode(invitationCode: string) {
  return fetcher<EnterInvitationCodeData>('/enter-invitation-code', {
    method: 'POST',
    disabledErrorToast: true,
    body: JSON.stringify({
      invitationCode,
    }),
  })
}
