import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, userKeys } from '@/shared/api/user';
import { authKeys } from '@/shared/api/auth';

export function useUpdateMyAvatarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => userApi.updateMyAvatar(file),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useUpdateUserAvatarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, file }: { userId: number; file: File }) =>
      userApi.updateUserAvatar(userId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
