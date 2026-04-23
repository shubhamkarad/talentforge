import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Briefcase, Home, LogOut, Moon, Plus, Settings, Sun, Users } from 'lucide-react';
import { useAuth, useEmployerJobs } from '@forge/data-client';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@forge/design-system';
import { useTheme } from '~/lib/theme';

// ⌘K palette for the recruiter console. Lists navigation, quick actions, and
// the user's own jobs so they can jump by title. Mounted once at the app
// layout and toggled by keyboard shortcut.
export function CommandPalette({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const jobs = useEmployerJobs(userId);

  // ⌘K / Ctrl+K toggle.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  function go(path: Parameters<typeof navigate>[0]['to'] extends infer _ ? string : never) {
    setOpen(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigate({ to: path as any });
  }

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    navigate({ to: '/' });
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command, job title, or page…" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go('/dashboard')}>
            <Home /> Dashboard
            <CommandShortcut>G D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/jobs')}>
            <Briefcase /> Jobs
            <CommandShortcut>G J</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/applications')}>
            <Users /> Applications
            <CommandShortcut>G A</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/settings')}>
            <Settings /> Settings
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => go('/jobs/new')}>
            <Plus /> Post a new job
            <CommandShortcut>N J</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
            {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
            Switch to {resolvedTheme === 'dark' ? 'light' : 'dark'} mode
          </CommandItem>
          <CommandItem onSelect={handleSignOut}>
            <LogOut /> Sign out
          </CommandItem>
        </CommandGroup>

        {jobs.data && jobs.data.length > 0 ? (
          <CommandGroup heading="Your jobs">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(jobs.data as any[]).slice(0, 8).map((j) => (
              <CommandItem
                key={j.id}
                value={`${j.title} ${j.companies?.name ?? ''}`}
                onSelect={() => {
                  setOpen(false);
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  navigate({ to: '/jobs/$jobId', params: { jobId: j.id } as any });
                }}
              >
                <Briefcase /> {j.title}
                <span className="text-muted-foreground ml-auto text-xs">{j.status}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}
