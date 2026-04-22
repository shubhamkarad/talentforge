import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import {
  Bell,
  Briefcase,
  Home,
  LogOut,
  MessagesSquare,
  Moon,
  Settings,
  Sun,
  Users,
  Zap,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { APP_NAME } from '@forge/shared';
import { useAuth, useUnreadNotificationCount } from '@forge/data-client';
import { Badge, Button, cn } from '@forge/design-system';
import { useTheme } from '~/lib/theme';

// Chrome for every authenticated route. Keeps the sidebar structure, topbar,
// and outlet composition in one place so individual pages stay focused on
// their own content.

interface NavItem {
  label: string;
  to: '/dashboard' | '/jobs' | '/applications' | '/messages' | '/settings';
  icon: ComponentType<{ className?: string }>;
}

const NAV: NavItem[] = [
  { label: 'Dashboard',    to: '/dashboard',    icon: Home },
  { label: 'Jobs',         to: '/jobs',         icon: Briefcase },
  { label: 'Applications', to: '/applications', icon: Users },
  { label: 'Messages',     to: '/messages',     icon: MessagesSquare },
  { label: 'Settings',     to: '/settings',     icon: Settings },
];

export function AppShell({ user }: { user: { id: string; email?: string; user_metadata?: { full_name?: string } } }) {
  const displayName = user.user_metadata?.full_name ?? user.email ?? 'Recruiter';
  return (
    <div className="flex min-h-dvh">
      <Sidebar displayName={displayName} email={user.email ?? ''} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar userId={user.id} />
        <main className="flex-1 bg-muted/20">
          <Outlet />
        </main>
      </div>
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
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border/70 bg-card md:flex">
      <div className="border-b border-border/70 px-5 py-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
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

      <div className="border-t border-border/70 p-3">
        <div className="rounded-lg bg-muted/60 p-3">
          <div className="truncate text-sm font-medium">{displayName}</div>
          <div className="truncate text-xs text-muted-foreground">{email}</div>
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
  const { data: unread = 0 } = useUnreadNotificationCount(userId);
  return (
    <header className="flex h-14 items-center justify-between border-b border-border/70 bg-background px-6">
      <div className="md:hidden">
        {/* mobile logo */}
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <Zap className="size-4" />
          </span>
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-end gap-2">
        <ThemeToggle />
        <NotificationBell unread={unread} />
      </div>
    </header>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const next = resolvedTheme === 'dark' ? 'light' : 'dark';
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
    >
      {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

function NotificationBell({ unread }: { unread: number }) {
  return (
    <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
      <Bell className="size-4" />
      {unread > 0 ? (
        <Badge
          variant="destructive"
          className="absolute -right-1 -top-1 h-4 min-w-4 justify-center px-1 py-0 text-[10px] leading-none"
        >
          {unread > 9 ? '9+' : unread}
        </Badge>
      ) : null}
    </Button>
  );
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
        {subtitle ? <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
