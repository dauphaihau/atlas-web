import { useRef, useState } from "react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet"
import {
  useUsersQuery,
  useCreateUserMutation,
  useImportUsersMutation,
  useUpdateUserAvatarMutation,
} from "@/shared/queries/user"
import type { UserDto } from "@/shared/api/user"
import { Skeleton } from "@/shared/ui/skeleton"
import { Plus, Upload, User as UserIcon } from "lucide-react"

function AvatarCell({
  user,
  onUpload,
}: {
  user: UserDto
  onUpload: (userId: number, file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(user.id, file)
    e.target.value = ""
  }
  return (
    <div className="flex items-center gap-2">
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt=""
          className="size-8 rounded-full object-cover"
        />
      ) : (
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
  )
}

export function UsersPage() {
  const usersQuery = useUsersQuery()
  const createUser = useCreateUserMutation()
  const importUsers = useImportUsersMutation()
  const updateAvatar = useUpdateUserAvatarMutation()

  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [importFile, setImportFile] = useState<File | null>(null)

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password) return
    createUser.mutate(
      { name: name.trim(), email: email.trim(), password },
      {
        onSuccess: () => {
          setAddOpen(false)
          setName("")
          setEmail("")
          setPassword("")
        },
      }
    )
  }

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFile) return
    importUsers.mutate(importFile, {
      onSuccess: () => {
        setImportOpen(false)
        setImportFile(null)
      },
    })
  }

  type ApiError = { message?: string; body?: { message?: string | string[] } }
  const createErr = createUser.error as ApiError | undefined
  const createError =
    createErr?.message ??
    (Array.isArray(createErr?.body?.message) ? createErr.body.message.join(", ") : createErr?.body?.message) ??
    null
  const importErr = importUsers.error as ApiError | undefined
  const importError =
    importErr?.message ??
    (Array.isArray(importErr?.body?.message) ? importErr.body.message.join(", ") : importErr?.body?.message) ??
    null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage users and permissions.
          </p>
        </div>
        <div className="flex gap-2">
          <Sheet open={addOpen} onOpenChange={setAddOpen}>
            <SheetTrigger>
              <Button size="sm">
                <Plus className="size-4" />
                Add user
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Add user</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 py-4">
                {createError && (
                  <p className="text-destructive text-sm" role="alert">
                    {createError}
                  </p>
                )}
                <div className="space-y-2">
                  <label htmlFor="user-name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="user-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    disabled={createUser.isPending}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="user-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="user-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    disabled={createUser.isPending}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="user-password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="user-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    minLength={8}
                    disabled={createUser.isPending}
                    required
                  />
                </div>
                <SheetFooter>
                  <SheetClose>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </SheetClose>
                  <Button type="submit" disabled={createUser.isPending}>
                    {createUser.isPending ? "Creating…" : "Create"}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
          <Sheet open={importOpen} onOpenChange={setImportOpen}>
            <SheetTrigger>
              <Button variant="outline" size="sm">
                <Upload className="size-4" />
                Import CSV
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Import users</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleImportSubmit} className="flex flex-col gap-4 py-4">
                {importError && (
                  <p className="text-destructive text-sm" role="alert">
                    {importError}
                  </p>
                )}
                <div className="space-y-2">
                  <label htmlFor="import-file" className="text-sm font-medium">
                    CSV file
                  </label>
                  <input
                    id="import-file"
                    type="file"
                    accept=".csv,.txt"
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm file:mr-2 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:text-primary-foreground"
                    onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                    disabled={importUsers.isPending}
                  />
                </div>
                <SheetFooter>
                  <SheetClose>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </SheetClose>
                  <Button type="submit" disabled={importUsers.isPending || !importFile}>
                    {importUsers.isPending ? "Importing…" : "Import"}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="rounded-lg border border-border">
        {usersQuery.isLoading ? (
          <div className="p-4 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : usersQuery.isError ? (
          <div className="p-4 text-destructive text-sm">
            {usersQuery.error instanceof Error ? usersQuery.error.message : "Failed to load users."}
          </div>
        ) : !usersQuery.data?.length ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No users yet. Add a user or import from CSV.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="h-10 px-4 text-left font-medium">Avatar</th>
                <th className="h-10 px-4 text-left font-medium">Name</th>
                <th className="h-10 px-4 text-left font-medium">Email</th>
                <th className="h-10 px-4 text-left font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {usersQuery.data.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <AvatarCell
                      user={user}
                      onUpload={(userId, file) =>
                        updateAvatar.mutate({ userId, file })
                      }
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.created_at ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
