import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@atlas/ui/button"
import { Input } from "@atlas/ui/input"
import { useRegisterMutation } from "@/shared/queries/auth"

export function RegisterPage() {
  const navigate = useNavigate()
  const register = useRegisterMutation()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const err = register.error as { body?: { message?: string | string[] }; message?: string } | undefined
  const errorMessage = err?.message
    ?? (Array.isArray(err?.body?.message) ? err.body.message.join(", ") : err?.body?.message)
    ?? null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password) return
    register.mutate(
      { name: name.trim(), email: email.trim(), password },
      {
        onSuccess: () => navigate("/", { replace: true }),
      }
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enter your name, email and password to register.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <p className="text-destructive text-sm" role="alert">
              {errorMessage}
            </p>
          )}
          <div className="space-y-2">
            <label htmlFor="register-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="register-name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={register.isPending}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="register-email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={register.isPending}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="register-password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={register.isPending}
              required
              minLength={8}
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full" disabled={register.isPending}>
            {register.isPending ? "Creating account…" : "Register"}
          </Button>
        </form>
        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
