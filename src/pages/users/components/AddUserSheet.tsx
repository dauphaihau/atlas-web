"use client"

import { useState } from "react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet"
import { useCreateUserMutation } from "@/shared/queries/user"
import { Plus } from "lucide-react"

type ApiError = { message?: string; body?: { message?: string | string[] } }

function getErrorMessage(err: ApiError | undefined): string | null {
  if (!err) return null
  const bodyMsg = Array.isArray(err.body?.message)
    ? err.body.message.join(", ")
    : err.body?.message
  return err.message ?? bodyMsg ?? null
}

export function AddUserSheet() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const createUser = useCreateUserMutation()
  const createError = getErrorMessage(createUser.error as ApiError | undefined)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password) return
    createUser.mutate(
      { name: name.trim(), email: email.trim(), password },
      {
        onSuccess: () => {
          setOpen(false)
          setName("")
          setEmail("")
          setPassword("")
        },
      }
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button size="sm" type="button" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Add user
      </Button>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Add user</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
          {createError != null && createError !== "" && (
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
  )
}
