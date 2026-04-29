import { UpdateProfileForm } from '@/features/user/components/update-profile-form';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Application and account settings.
        </p>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-medium">Profile</h2>
        <UpdateProfileForm />
      </div>
    </div>
  );
}
