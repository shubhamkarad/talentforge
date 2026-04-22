import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpInput } from '@forge/shared';
import { useAuth } from '@forge/data-client';
import { Button, Input, Label, toast } from '@forge/design-system';
import { AuthShell } from '~/components/auth-shell';

// Seeker app is candidate-only — role is forced, not asked for.
// Employers sign up through the recruiter console.
export const Route = createFileRoute('/signup')({
  component: SignupPage,
});

function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      role: 'candidate',
    },
  });

  async function onSubmit(values: SignUpInput) {
    const { data, error } = await signUp(values.email, values.password, {
      role: 'candidate',
      fullName: values.fullName,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      toast.success('Check your inbox to confirm your email, then log in.');
      navigate({ to: '/login' });
      return;
    }
    toast.success(`You're in. Let's find you something great.`);
    navigate({ to: '/dashboard' });
  }

  return (
    <AuthShell
      title="Create your profile"
      subtitle="Takes a minute. You can upload your resume after sign-up to skip data entry."
      footer={
        <p className="text-sm text-muted-foreground">
          Already set up?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Your name" error={form.formState.errors.fullName?.message}>
          <Input autoComplete="name" {...form.register('fullName')} />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" autoComplete="email" {...form.register('email')} />
        </Field>
        <Field label="Password" error={form.formState.errors.password?.message}>
          <Input type="password" autoComplete="new-password" {...form.register('password')} />
        </Field>
        <Field label="Confirm password" error={form.formState.errors.confirmPassword?.message}>
          <Input
            type="password"
            autoComplete="new-password"
            {...form.register('confirmPassword')}
          />
        </Field>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By signing up you agree to the terms of service.
        </p>
      </form>
    </AuthShell>
  );
}

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
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
