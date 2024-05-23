import fetcher from '@/utils/fetcher'

export default function enterInvitationCode(invitationCode: string) {
  return fetcher<string>('/enter-invitation-code', {
    method: 'POST',
    disabledErrorToast: true,
    body: JSON.stringify({
      invitationCode,
    }),
  })
}
