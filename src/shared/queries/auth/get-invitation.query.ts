import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/shared/api/auth';

export function useInvitationQuery(email: string, token: string) {
  return useQuery({
    queryKey: ['auth', 'invitation', email, token],
    queryFn: () => authApi.invitation(email, token),
    enabled: email !== '' && token !== '',
    retry: false,
  });
}
