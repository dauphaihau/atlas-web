import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateUserRequestDto } from '@/shared/api/user';
import { userApi, userKeys } from '@/shared/api/user';

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserRequestDto }) =>
      userApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
