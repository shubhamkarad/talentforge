import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  updateCompanySchema,
  updateProfileSchema,
  type UpdateCompanyInput,
  type UpdateProfileInput,
} from '@forge/shared';
import {
  useCompany,
  useCreateCompany,
  useProfile,
  useUpdateCompany,
  useUpdateProfile,
} from '@forge/data-client';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Skeleton,
  Textarea,
  toast,
} from '@forge/design-system';
import { PageHeader } from '~/components/app-shell';

export const Route = createFileRoute('/_app/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader title="Settings" subtitle="Account and company profile." />
      <div className="space-y-8">
        <AccountSection userId={user.id} email={user.email ?? ''} />
        <CompanySection userId={user.id} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Account
// ---------------------------------------------------------------------------

function AccountSection({ userId, email }: { userId: string; email: string }) {
  const profile = useProfile(userId);
  const updateProfile = useUpdateProfile();

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName: '', phone: '', avatarUrl: '' },
  });

  // Seed the form once the profile loads.
  useEffect(() => {
    if (!profile.data) return;
    form.reset({
      fullName: profile.data.full_name ?? '',
      phone: profile.data.phone ?? '',
      avatarUrl: profile.data.avatar_url ?? '',
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
          avatar_url: values.avatarUrl || undefined,
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
          <Skeleton className="h-48 w-full" />
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Full name" error={form.formState.errors.fullName?.message}>
              <Input {...form.register('fullName')} />
            </Field>
            <Field label="Phone" error={form.formState.errors.phone?.message}>
              <Input {...form.register('phone')} />
            </Field>
            <Field label="Avatar URL" error={form.formState.errors.avatarUrl?.message}>
              <Input placeholder="https://..." {...form.register('avatarUrl')} />
            </Field>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || updateProfile.isPending}
              >
                {updateProfile.isPending ? 'Saving…' : 'Save account'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Company
// ---------------------------------------------------------------------------

function CompanySection({ userId }: { userId: string }) {
  const company = useCompany(userId);
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();

  const form = useForm<UpdateCompanyInput>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: {
      name: '',
      description: '',
      website: '',
      logoUrl: '',
      industry: '',
      headquarters: '',
      cultureDescription: '',
      benefits: [],
      socialLinks: { linkedin: '', twitter: '', facebook: '' },
    },
  });

  useEffect(() => {
    if (!company.data) return;
    form.reset({
      name: company.data.name ?? '',
      description: company.data.description ?? '',
      website: company.data.website ?? '',
      logoUrl: company.data.logo_url ?? '',
      industry: company.data.industry ?? '',
      size: company.data.size ?? undefined,
      foundedYear: company.data.founded_year ?? undefined,
      headquarters: company.data.headquarters ?? '',
      cultureDescription: company.data.culture_description ?? '',
      benefits: Array.isArray(company.data.benefits) ? (company.data.benefits as string[]) : [],
      socialLinks:
        company.data.social_links && typeof company.data.social_links === 'object'
          ? (company.data.social_links as {
              linkedin?: string;
              twitter?: string;
              facebook?: string;
            })
          : {},
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company.data?.id]);

  async function onSubmit(values: UpdateCompanyInput) {
    const patch = {
      name: values.name,
      description: values.description || null,
      website: values.website || null,
      logo_url: values.logoUrl || null,
      industry: values.industry || null,
      size: values.size ?? null,
      founded_year: values.foundedYear ?? null,
      headquarters: values.headquarters || null,
      culture_description: values.cultureDescription || null,
      benefits: values.benefits ?? [],
      social_links: values.socialLinks ?? {},
    };

    try {
      if (company.data) {
        await updateCompany.mutateAsync({ id: company.data.id, ...patch });
        toast.success('Company updated.');
      } else {
        await createCompany.mutateAsync({ owner_id: userId, ...patch });
        toast.success('Company created.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    }
  }

  const saving = createCompany.isPending || updateCompany.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company</CardTitle>
        <CardDescription>
          {company.data
            ? 'Edit the company profile candidates see on your job postings.'
            : 'You need a company profile before you can publish a job.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {company.isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Name" error={form.formState.errors.name?.message}>
              <Input {...form.register('name')} />
            </Field>
            <Field label="Description" error={form.formState.errors.description?.message}>
              <Textarea rows={4} {...form.register('description')} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Website" error={form.formState.errors.website?.message}>
                <Input placeholder="https://..." {...form.register('website')} />
              </Field>
              <Field label="Logo URL" error={form.formState.errors.logoUrl?.message}>
                <Input placeholder="https://..." {...form.register('logoUrl')} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Industry">
                <Input {...form.register('industry')} />
              </Field>
              <Field label="Size">
                <Select {...form.register('size')}>
                  <option value="">—</option>
                  <option value="1-10">1–10</option>
                  <option value="11-50">11–50</option>
                  <option value="51-200">51–200</option>
                  <option value="201-500">201–500</option>
                  <option value="501-1000">501–1000</option>
                  <option value="1000+">1000+</option>
                </Select>
              </Field>
              <Field label="Founded" error={form.formState.errors.foundedYear?.message}>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="2014"
                  {...form.register('foundedYear', { valueAsNumber: true })}
                />
              </Field>
            </div>
            <Field label="Headquarters">
              <Input placeholder="City, Country" {...form.register('headquarters')} />
            </Field>
            <Field label="Culture" error={form.formState.errors.cultureDescription?.message}>
              <Textarea
                rows={3}
                placeholder="How your team works together, what you optimize for, how you make decisions."
                {...form.register('cultureDescription')}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="LinkedIn URL"
                error={form.formState.errors.socialLinks?.linkedin?.message}
              >
                <Input
                  placeholder="https://linkedin.com/..."
                  {...form.register('socialLinks.linkedin')}
                />
              </Field>
              <Field
                label="Twitter URL"
                error={form.formState.errors.socialLinks?.twitter?.message}
              >
                <Input placeholder="https://x.com/..." {...form.register('socialLinks.twitter')} />
              </Field>
              <Field
                label="Facebook URL"
                error={form.formState.errors.socialLinks?.facebook?.message}
              >
                <Input
                  placeholder="https://facebook.com/..."
                  {...form.register('socialLinks.facebook')}
                />
              </Field>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : company.data ? 'Save changes' : 'Create company'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Field helper
// ---------------------------------------------------------------------------

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
