import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Bookmark,
  Briefcase,
  Compass,
  FileText,
  Home,
  LogOut,
  MessagesSquare,
  Moon,
  Settings,
  Sun,
  User,
} from 'lucide-react';
import { useAuth, useCandidateApplications, useSavedJobs } from '@forge/data-client';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@forge/design-system';
import { useTheme } from '~/lib/theme';

export function CommandPalette({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const applications = useCandidateApplications(userId);
  const saved = useSavedJobs(userId);

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

  function go(path: string) {
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
      <CommandInput placeholder="Type a command, job, or page…" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go('/dashboard')}>
            <Home /> Home
          </CommandItem>
          <CommandItem onSelect={() => go('/jobs')}>
            <Briefcase /> Jobs
          </CommandItem>
          <CommandItem onSelect={() => go('/applications')}>
            <FileText /> Applications
          </CommandItem>
          <CommandItem onSelect={() => go('/messages')}>
            <MessagesSquare /> Messages
          </CommandItem>
          <CommandItem onSelect={() => go('/saved')}>
            <Bookmark /> Saved jobs
          </CommandItem>
          <CommandItem onSelect={() => go('/career')}>
            <Compass /> Career forecast
          </CommandItem>
          <CommandItem onSelect={() => go('/profile')}>
            <User /> Profile
          </CommandItem>
          <CommandItem onSelect={() => go('/settings')}>
            <Settings /> Settings
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
            {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
            Switch to {resolvedTheme === 'dark' ? 'light' : 'dark'} mode
          </CommandItem>
          <CommandItem onSelect={handleSignOut}>
            <LogOut /> Sign out
          </CommandItem>
        </CommandGroup>

        {applications.data && applications.data.length > 0 ? (
          <CommandGroup heading="Your applications">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(applications.data as any[]).slice(0, 6).map((a) => (
              <CommandItem
                key={a.id}
                value={`${a.jobs?.title ?? ''} ${a.jobs?.companies?.name ?? ''}`}
                onSelect={() => {
                  setOpen(false);
                  navigate({
                    to: '/applications/$applicationId',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    params: { applicationId: a.id } as any,
                  });
                }}
              >
                <FileText /> {a.jobs?.title ?? 'Application'}
                <span className="text-muted-foreground ml-auto text-xs">{a.status}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}

        {saved.data && saved.data.length > 0 ? (
          <CommandGroup heading="Saved jobs">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(saved.data as any[]).slice(0, 6).map((row) => {
              const j = row.jobs;
              if (!j) return null;
              return (
                <CommandItem
                  key={row.id}
                  value={`${j.title} ${j.companies?.name ?? ''}`}
                  onSelect={() => {
                    setOpen(false);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    navigate({ to: '/jobs/$jobId', params: { jobId: j.id } as any });
                  }}
                >
                  <Bookmark /> {j.title}
                  <span className="text-muted-foreground ml-auto text-xs">{j.companies?.name}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}
