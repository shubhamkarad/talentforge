import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpInput } from '@forge/shared';
import { useAuth } from '@forge/data-client';
import { Button, Input, Label, toast } from '@forge/design-system';
import { AuthShell } from '~/components/auth-shell';

// This console is employer-only — role is forced here rather than asked for.
// Candidates sign up through the seeker app (which forces role=candidate).
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
      role: 'employer',
    },
  });

  async function onSubmit(values: SignUpInput) {
    const { data, error } = await signUp(values.email, values.password, {
      role: 'employer',
      fullName: values.fullName,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      // Email confirmations are on — tell the user to finish there.
      toast.success('Check your inbox to confirm your email, then log in.');
      navigate({ to: '/login' });
      return;
    }
    toast.success('Welcome to Talentforge.');
    navigate({ to: '/dashboard' });
  }

  return (
    <AuthShell
      title="Create your company"
      subtitle="Takes under a minute. Invite teammates once you're in."
      footer={
        <p className="text-muted-foreground text-sm">
          Already set up?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <Field label="Your name" error={form.formState.errors.fullName?.message}>
          <Input autoComplete="name" {...form.register('fullName')} />
        </Field>
        <Field label="Work email" error={form.formState.errors.email?.message}>
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
        <p className="text-muted-foreground text-center text-xs">
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
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
