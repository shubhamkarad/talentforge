import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import {
  Briefcase,
  Home,
  LogOut,
  MessagesSquare,
  Search,
  Settings,
  Users,
  Zap,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { APP_NAME } from '@forge/shared';
import { useAuth } from '@forge/data-client';
import { Button, ThemeToggle as ThemeTogglePill, cn } from '@forge/design-system';
import { useTheme } from '~/lib/theme';
import { CommandPalette } from '~/components/command-palette';
import { NotificationCenter } from '~/components/notification-center';

// Chrome for every authenticated route. Keeps the sidebar structure, topbar,
// and outlet composition in one place so individual pages stay focused on
// their own content.

interface NavItem {
  label: string;
  to: '/dashboard' | '/jobs' | '/applications' | '/messages' | '/settings';
  icon: ComponentType<{ className?: string }>;
}

const NAV: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: Home },
  { label: 'Jobs', to: '/jobs', icon: Briefcase },
  { label: 'Applications', to: '/applications', icon: Users },
  { label: 'Messages', to: '/messages', icon: MessagesSquare },
  { label: 'Settings', to: '/settings', icon: Settings },
];

export function AppShell({
  user,
}: {
  user: { id: string; email?: string; user_metadata?: { full_name?: string } };
}) {
  const displayName = user.user_metadata?.full_name ?? user.email ?? 'Recruiter';
  return (
    <div className="flex min-h-dvh">
      <Sidebar displayName={displayName} email={user.email ?? ''} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar userId={user.id} />
        <main className="bg-muted/20 flex-1">
          <Outlet />
        </main>
      </div>
      <CommandPalette userId={user.id} />
    </div>
  );
}

function Sidebar({ displayName, email }: { displayName: string; email: string }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate({ to: '/' });
  }

  return (
    <aside className="border-border/70 bg-card hidden w-60 shrink-0 flex-col border-r md:flex">
      <div className="border-border/70 border-b px-5 py-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-md">
            <Zap className="size-4" />
          </span>
          {APP_NAME}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => (
          <NavLink key={item.to} {...item} />
        ))}
      </nav>

      <div className="border-border/70 border-t p-3">
        <div className="bg-muted/60 rounded-lg p-3">
          <div className="truncate text-sm font-medium">{displayName}</div>
          <div className="text-muted-foreground truncate text-xs">{email}</div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </div>
    </aside>
  );
}

function NavLink({ label, to, icon: Icon }: NavItem) {
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(`${to}/`);
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

function Topbar({ userId }: { userId: string }) {
  return (
    <header className="border-border/70 bg-background flex h-14 items-center justify-between gap-4 border-b px-6">
      <div className="md:hidden">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-md">
            <Zap className="size-4" />
          </span>
        </Link>
      </div>
      <CommandTrigger />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationCenter userId={userId} />
      </div>
    </header>
  );
}

function CommandTrigger() {
  function open() {
    // Dispatch a synthetic ⌘K so the palette's own listener handles it.
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  }
  return (
    <button
      type="button"
      onClick={open}
      className="group border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground hidden h-9 w-full max-w-md items-center gap-2 rounded-md border px-3 text-left text-sm transition-colors md:flex"
    >
      <Search className="size-4" />
      <span className="flex-1">Jump to…</span>
      <span className="text-muted-foreground/70 font-mono text-[10px] tracking-widest">⌘K</span>
    </button>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return <ThemeTogglePill mode={resolvedTheme} onChange={(m) => setTheme(m)} />;
}

// Keep type in one place: every page inside /_app can render a PageHeader
// for consistent titling.
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <div className="text-muted-foreground mt-1 text-sm">{subtitle}</div> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
