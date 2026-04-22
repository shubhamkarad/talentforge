import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogOut } from 'lucide-react';
import { updateProfileSchema, type UpdateProfileInput } from '@forge/shared';
import { useAuth, useProfile, useUpdateProfile } from '@forge/data-client';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
  toast,
} from '@forge/design-system';
import { PageHeader } from '~/components/app-shell';
import { useTheme } from '~/lib/theme';

export const Route = createFileRoute('/_app/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <PageHeader title="Settings" subtitle="Account, appearance, and session." />
      <div className="space-y-6">
        <AccountSection userId={user.id} email={user.email ?? ''} />
        <AppearanceSection />
        <SessionSection />
      </div>
    </div>
  );
}

function AccountSection({ userId, email }: { userId: string; email: string }) {
  const profile = useProfile(userId);
  const updateProfile = useUpdateProfile();

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName: '', phone: '' },
  });

  useEffect(() => {
    if (!profile.data) return;
    form.reset({
      fullName: profile.data.full_name ?? '',
      phone: profile.data.phone ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.data?.id]);

  async function onSubmit(values: UpdateProfileInput) {
    try {
      await updateProfile.mutateAsync({
        userId,
        patch: {
          full_name: values.fullName,
          phone: values.phone || undefined,
        },
      });
      toast.success('Account updated.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          Signed in as <span className="text-foreground font-medium">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {profile.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input {...form.register('fullName')} />
              {form.formState.errors.fullName ? (
                <p className="text-destructive text-xs">{form.formState.errors.fullName.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input {...form.register('phone')} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Light, dark, or follow your system.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <Button
              key={t}
              variant={theme === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme(t)}
              className="capitalize"
            >
              {t}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SessionSection() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  async function handleSignOut() {
    await signOut();
    navigate({ to: '/' });
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="size-4" /> Sign out
        </Button>
      </CardContent>
    </Card>
  );
}
