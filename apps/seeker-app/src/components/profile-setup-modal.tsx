import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { FileUp, PenLine } from 'lucide-react';
import { useUpdateProfile } from '@forge/data-client';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  toast,
} from '@forge/design-system';

interface Props {
  userId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: any | null | undefined;
  loading: boolean;
}

const DISMISSED_KEY = 'forge.seeker.onboarding-dismissed';

// Shown once on first login while onboarding is incomplete. The user can:
//   - go upload a resume (resume extraction fills most of the profile),
//   - fill the profile by hand, or
//   - skip for now (we mark `onboarding_completed=true` on the profile so this
//     never fires again).
export function ProfileSetupModal({ userId, profile, loading }: Props) {
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    // Profile query already ran — work out whether to show.
    if (!profile) return;
    const onboarded = profile.profiles?.onboarding_completed ?? false;
    const completeness = profile.profile_completeness ?? 0;
    const dismissed =
      typeof window !== 'undefined' && window.sessionStorage.getItem(DISMISSED_KEY) === '1';
    if (!onboarded && completeness < 30 && !dismissed) {
      setOpen(true);
    }
  }, [loading, profile]);

  async function dismiss(markOnboarded: boolean) {
    setOpen(false);
    if (typeof window !== 'undefined') window.sessionStorage.setItem(DISMISSED_KEY, '1');
    if (markOnboarded) {
      try {
        await updateProfile.mutateAsync({
          userId,
          patch: { onboarding_completed: true } as never,
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not update profile');
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && dismiss(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set up your profile</DialogTitle>
          <DialogDescription>
            Match scores only work when we know what you've done. Two ways to seed it:
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <button
            type="button"
            onClick={() => {
              dismiss(true);
              navigate({ to: '/profile' });
            }}
            className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
              <FileUp className="size-4" />
            </span>
            <span>
              <span className="font-medium">Upload your resume</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                AI extracts your skills, experience, and links. Takes ~20 seconds.
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              dismiss(true);
              navigate({ to: '/profile' });
            }}
            className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
              <PenLine className="size-4" />
            </span>
            <span>
              <span className="font-medium">Fill it in by hand</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Takes longer, but you control exactly what lands where.
              </span>
            </span>
          </button>
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => dismiss(false)}>
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
