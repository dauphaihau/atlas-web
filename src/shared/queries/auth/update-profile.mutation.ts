import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateProfileRequestDto } from '@/shared/api/auth';
import { authApi, authKeys } from '@/shared/api/auth';

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfileRequestDto) => authApi.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}
