import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Bell, CheckCheck } from 'lucide-react';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '@forge/data-client';
import {
  Badge,
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Skeleton,
} from '@forge/design-system';
import { formatRelativeTime } from '@forge/shared';

export function NotificationCenter({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const notifications = useNotifications(userId);
  const { data: unread = 0 } = useUnreadNotificationCount(userId);
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (notifications.data ?? []) as any[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleRowClick(n: any) {
    if (!n.read) markOne.mutate(n.id);
    setOpen(false);
    if (typeof n.action_url === 'string' && n.action_url.startsWith('/')) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigate({ to: n.action_url as any });
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        className="relative"
        onClick={() => setOpen(true)}
      >
        <Bell className="size-4" />
        {unread > 0 ? (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-4 min-w-4 justify-center px-1 py-0 text-[10px] leading-none"
          >
            {unread > 9 ? '9+' : unread}
          </Badge>
        ) : null}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-border/60 border-b px-5 py-4">
            <DialogTitle className="flex items-center justify-between gap-3">
              <span>Notifications</span>
              {unread > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAll.mutate(userId)}
                  disabled={markAll.isPending}
                >
                  <CheckCheck className="size-3.5" /> Mark all read
                </Button>
              ) : null}
            </DialogTitle>
            <DialogDescription className="sr-only">Your notification feed</DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <EmptyState />
            ) : (
              <ul className="divide-border/60 divide-y">
                {rows.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleRowClick(n)}
                      className={cn(
                        'hover:bg-muted/40 flex w-full items-start gap-3 px-5 py-3 text-left transition-colors',
                        !n.read && 'bg-primary/5',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-1.5 size-2 shrink-0 rounded-full',
                          n.read ? 'bg-muted' : 'bg-primary',
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{n.title}</div>
                        {n.body ? (
                          <div className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                            {n.body}
                          </div>
                        ) : null}
                        <div className="text-muted-foreground mt-1 text-[10px]">
                          {formatRelativeTime(n.created_at)}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-12 text-center">
      <div className="bg-muted text-muted-foreground mx-auto grid size-10 place-items-center rounded-full">
        <Bell className="size-5" />
      </div>
      <h3 className="mt-3 text-sm font-semibold">No notifications yet</h3>
      <p className="text-muted-foreground mx-auto mt-1 max-w-xs text-xs">
        Updates about applications, messages, and interviews will appear here.
      </p>
    </div>
  );
}
