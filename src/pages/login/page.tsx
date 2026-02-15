import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { useLoginMutation } from "@/shared/queries/auth"

export function LoginPage() {
  const navigate = useNavigate()
  const login = useLoginMutation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  type ApiError = { message?: string; body?: { message?: string | string[] } }
  const err = login.error as ApiError | undefined
  const errorMessage =
    err?.message ??
    (Array.isArray(err?.body?.message) ? err.body.message.join(", ") : err?.body?.message) ??
    null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => navigate("/", { replace: true }),
      }
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Use your email and password to sign in.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <p className="text-destructive text-sm" role="alert">
              {errorMessage}
            </p>
          )}
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={login.isPending}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="login-password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={login.isPending}
              required
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="text-muted-foreground text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-primary underline-offset-4 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
