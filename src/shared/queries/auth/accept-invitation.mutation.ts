import { useMutation } from '@tanstack/react-query';
import type { AcceptInvitationRequestDto } from '@/shared/api/auth';
import { authApi } from '@/shared/api/auth';

export function useAcceptInvitationMutation() {
  return useMutation({
    mutationFn: (payload: AcceptInvitationRequestDto) => authApi.acceptInvitation(payload),
  });
}
