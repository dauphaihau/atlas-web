import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RegisterRequestDto } from '@/shared/api/auth';
import { authApi, authKeys } from '@/shared/api/auth';

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterRequestDto) => authApi.register(payload),
    onSuccess: (registerResponse) => {
      queryClient.setQueryData(authKeys.me(), registerResponse.user);
    },
  });
}
