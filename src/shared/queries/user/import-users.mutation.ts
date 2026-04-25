import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, userKeys } from '@/shared/api/user';
import { useImportProgressStore } from '@/shared/store/import-progress.store';

export function useImportUsersMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => userApi.importUsers(file),
    onSuccess: (data, variables) => {
      useImportProgressStore.getState().setActiveImport({
        id: data.id,
        fileName: variables.name,
        fileSize: variables.size,
      });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
