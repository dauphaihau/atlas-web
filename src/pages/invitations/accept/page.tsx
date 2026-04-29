import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Button } from '@atlas/ui/button';
import { Input } from '@atlas/ui/input';
import { Progress } from '@atlas/ui/progress';
import { Skeleton } from '@atlas/ui/skeleton';
import { useAcceptInvitationMutation, useInvitationQuery } from '@/shared/queries/auth';

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (pw.length === 0) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 20, label: 'Weak', color: 'bg-destructive' };
  if (score === 2) return { score: 40, label: 'Fair', color: 'bg-orange-400' };
  if (score === 3) return { score: 65, label: 'Good', color: 'bg-yellow-400' };
  return { score: 100, label: 'Strong', color: 'bg-green-500' };
}

export function AcceptInvitationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const token = searchParams.get('token') ?? '';

  const invitation = useInvitationQuery(email, token);
  const acceptInvitation = useAcceptInvitationMutation();

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isLinkInvalid = email === '' || token === '' || invitation.isError;
  const strength = passwordStrength(password);

  const confirmError = useMemo(() => {
    if (confirmation === '' || password === '') return null;
    if (password !== confirmation) return 'Passwords do not match.';
    return null;
  }, [password, confirmation]);

  const canSubmit =
    invitation.isSuccess &&
    password.length >= 8 &&
    password === confirmation &&
    !acceptInvitation.isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    acceptInvitation.mutate(
      { email, token, password, password_confirmation: confirmation },
      { onSuccess: () => navigate('/login', { replace: true }) }
    );
  }

  const apiError =
    acceptInvitation.error instanceof Error ? acceptInvitation.error.message : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">You've been invited</h1>
          {invitation.isLoading ? (
            <Skeleton className="h-4 w-56" />
          ) : invitation.isSuccess ? (
            <p className="text-muted-foreground text-sm">
              Welcome, {invitation.data.name}. Set a password for{' '}
              <strong className="text-foreground">{invitation.data.email}</strong> to finish setup.
            </p>
          ) : null}
        </div>

        {isLinkInvalid ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 space-y-0.5">
            <p className="text-destructive text-sm font-medium">
              This invite link is invalid or has expired.
            </p>
            <p className="text-destructive/80 text-sm">
              Contact your admin to request a new invitation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {apiError && (
              <p className="text-destructive text-sm" role="alert">
                {apiError}
              </p>
            )}

            <div className="space-y-2">
              <label htmlFor="invite-password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="invite-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                  disabled={!invitation.isSuccess || acceptInvitation.isPending}
                  autoFocus={invitation.isSuccess}
                  className="w-full pr-9"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className={`h-full rounded-full transition-[width,background-color] duration-300 ${strength.color}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{strength.label}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="invite-password-confirmation" className="text-sm font-medium">
                Confirm password
              </label>
              <div className="relative">
                <Input
                  id="invite-password-confirmation"
                  type={showConfirmation ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setConfirmation(event.target.value)}
                  disabled={!invitation.isSuccess || acceptInvitation.isPending}
                  className="w-full pr-9"
                />
                <button
                  type="button"
                  aria-label={showConfirmation ? 'Hide password' : 'Show password'}
                  onClick={() => setShowConfirmation((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirmation ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
              {confirmError && (
                <p className="text-destructive text-sm" role="alert">
                  {confirmError}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {acceptInvitation.isPending ? 'Setting up…' : 'Set password'}
            </Button>
          </form>
        )}

        <p className="text-muted-foreground text-center text-sm">
          <Link to="/login" className="text-primary underline-offset-4 hover:underline">
            ← Back to sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
