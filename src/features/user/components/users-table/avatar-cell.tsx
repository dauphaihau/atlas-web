import { useRef } from 'react';
import { Button } from '@atlas/ui/button';
import type { UserDto } from '@/shared/api/user';
import { User as UserIcon } from 'lucide-react';

export function AvatarCell({
  user,
  onUpload,
}: {
  user: UserDto
  onUpload: (userId: number, file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onUpload(user.id, file);
    event.target.value = '';
  };
  return (
    <div className="flex items-center gap-2">
      {user.avatar_url
        ? (
          <img
            src={user.avatar_url}
            alt=""
            className="size-8 rounded-full object-cover"
          />
        )
        : (
          <div className="flex size-8 items-center justify-center rounded-full bg-muted">
            <UserIcon className="size-4 text-muted-foreground" />
          </div>
        )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={() => inputRef.current?.click()}
      >
        Upload
      </Button>
    </div>
  );
}
