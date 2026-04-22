import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MessagesSquare, Send } from 'lucide-react';
import { formatRelativeTime, initialsOf } from '@forge/shared';
import {
  useMarkMessagesRead,
  useMessageThreads,
  useMessages,
  useSendMessage,
} from '@forge/data-client';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  cn,
  Skeleton,
  Textarea,
  toast,
} from '@forge/design-system';
import { PageHeader } from '~/components/app-shell';

export const Route = createFileRoute('/_app/messages')({
  validateSearch: (search: Record<string, unknown>): { thread?: string } => ({
    thread: typeof search.thread === 'string' ? search.thread : undefined,
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { user } = Route.useRouteContext();
  const { thread: selectedThreadId } = Route.useSearch();
  const navigate = useNavigate();

  const threads = useMessageThreads(user.id, 'candidate');

  const activeThread = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list = (threads.data ?? []) as any[];
    if (!list.length) return null;
    if (selectedThreadId) return list.find((t) => t.id === selectedThreadId) ?? list[0];
    return list[0];
  }, [threads.data, selectedThreadId]);

  function openThread(id: string) {
    navigate({ to: '/messages', search: { thread: id } });
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title="Messages"
        subtitle="One thread per application. Employer replies land live."
      />

      <Card className="overflow-hidden">
        <div className="grid min-h-[560px] md:grid-cols-[280px_1fr]">
          <ThreadList
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            threads={(threads.data ?? []) as any[]}
            loading={threads.isLoading}
            activeId={activeThread?.id ?? null}
            onSelect={openThread}
            currentUserId={user.id}
          />
          <ActiveThreadPane thread={activeThread} currentUserId={user.id} />
        </div>
      </Card>
    </div>
  );
}

function ThreadList({
  threads,
  loading,
  activeId,
  onSelect,
  currentUserId,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  threads: any[];
  loading: boolean;
  activeId: string | null;
  onSelect: (id: string) => void;
  currentUserId: string;
}) {
  return (
    <div className="border-border/70 border-b md:border-r md:border-b-0">
      <div className="border-border/70 text-muted-foreground border-b px-4 py-3 text-xs font-semibold tracking-wider uppercase">
        Threads
      </div>
      {loading ? (
        <div className="space-y-1 p-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="text-muted-foreground px-6 py-10 text-center text-sm">
          No threads yet. Open an application and hit <b>Message employer</b> to start one.
        </div>
      ) : (
        <ul className="max-h-[600px] overflow-y-auto">
          {threads.map((t) => (
            <ThreadRow
              key={t.id}
              thread={t}
              active={t.id === activeId}
              onSelect={() => onSelect(t.id)}
              currentUserId={currentUserId}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ThreadRow({
  thread,
  active,
  onSelect,
  currentUserId,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  thread: any;
  active: boolean;
  onSelect: () => void;
  currentUserId: string;
}) {
  const employerName = thread.employer?.full_name ?? 'Employer';
  const companyName =
    thread.application?.jobs?.companies?.name ?? thread.application?.jobs?.title ?? '';
  const unread = thread.candidate_unread_count ?? 0;
  const lastMessage: { content?: string; sender_id?: string } | undefined = (thread.messages ?? [])[
    thread.messages?.length - 1
  ];
  const preview = lastMessage?.content
    ? (lastMessage.sender_id === currentUserId ? 'You: ' : '') + lastMessage.content
    : 'No messages yet';

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'border-border/60 flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors',
          active ? 'bg-primary/5' : 'hover:bg-muted/40',
        )}
      >
        <Avatar className="size-9 shrink-0">
          <AvatarFallback className="text-xs">{initialsOf(employerName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium">{employerName}</span>
            {thread.last_message_at ? (
              <span className="text-muted-foreground shrink-0 text-[10px]">
                {formatRelativeTime(thread.last_message_at)}
              </span>
            ) : null}
          </div>
          <div className="text-muted-foreground truncate text-xs">{companyName}</div>
          <div
            className={cn(
              'mt-0.5 truncate text-xs',
              unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground',
            )}
          >
            {preview}
          </div>
        </div>
        {unread > 0 ? (
          <Badge
            variant="default"
            className="mt-1 ml-1 h-5 min-w-5 justify-center px-1.5 text-[10px]"
          >
            {unread > 9 ? '9+' : unread}
          </Badge>
        ) : null}
      </button>
    </li>
  );
}

function ActiveThreadPane({
  thread,
  currentUserId,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  thread: any | null;
  currentUserId: string;
}) {
  if (!thread) {
    return (
      <div className="grid place-items-center px-6 py-12">
        <div className="text-center">
          <div className="bg-muted text-muted-foreground mx-auto grid size-10 place-items-center rounded-full">
            <MessagesSquare className="size-5" />
          </div>
          <h3 className="mt-3 text-sm font-semibold">Select a thread</h3>
          <p className="text-muted-foreground mx-auto mt-1 max-w-xs text-xs">
            Pick a conversation on the left to start reading.
          </p>
        </div>
      </div>
    );
  }
  return <ThreadChat thread={thread} currentUserId={currentUserId} />;
}

function ThreadChat({
  thread,
  currentUserId,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  thread: any;
  currentUserId: string;
}) {
  const messages = useMessages(thread.id);
  const sendMessage = useSendMessage();
  const markRead = useMarkMessagesRead();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if ((thread.candidate_unread_count ?? 0) > 0) {
      markRead.mutate({ threadId: thread.id, userId: currentUserId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.id, messages.data?.length]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.data?.length]);

  const employerName = thread.employer?.full_name ?? 'Employer';
  const companyName =
    thread.application?.jobs?.companies?.name ?? thread.application?.jobs?.title ?? '';

  async function handleSend() {
    const content = draft.trim();
    if (!content || sendMessage.isPending) return;
    try {
      await sendMessage.mutateAsync({
        threadId: thread.id,
        senderId: currentUserId,
        content,
      });
      setDraft('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Send failed');
    }
  }

  return (
    <div className="flex flex-col">
      <div className="border-border/70 flex items-center gap-3 border-b px-6 py-4">
        <Avatar className="size-9">
          <AvatarFallback className="text-xs">{initialsOf(employerName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{employerName}</div>
          <div className="text-muted-foreground truncate text-xs">{companyName}</div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="bg-muted/20 flex-1 space-y-3 overflow-y-auto px-6 py-6"
        style={{ maxHeight: '440px' }}
      >
        {messages.isLoading ? (
          <>
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="ml-auto h-10 w-1/2" />
            <Skeleton className="h-10 w-3/4" />
          </>
        ) : (messages.data ?? []).length === 0 ? (
          <div className="text-muted-foreground py-8 text-center text-xs">
            No messages yet. Say hi.
          </div>
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (messages.data as any[]).map((m) => (
            <MessageBubble key={m.id} message={m} mine={m.sender_id === currentUserId} />
          ))
        )}
      </div>

      <div className="border-border/70 border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder="Type a message…"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button type="submit" disabled={!draft.trim() || sendMessage.isPending}>
            <Send className="size-4" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  mine,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any;
  mine: boolean;
}) {
  const senderName = message.sender?.full_name ?? '—';
  return (
    <div className={cn('flex gap-2', mine ? 'justify-end' : 'justify-start')}>
      {!mine ? (
        <Avatar className="size-7 shrink-0">
          <AvatarFallback className="text-[10px]">{initialsOf(senderName)}</AvatarFallback>
        </Avatar>
      ) : null}
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
          mine
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-background rounded-bl-sm shadow-sm',
        )}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div
          className={cn(
            'mt-1 text-right text-[10px]',
            mine ? 'text-primary-foreground/70' : 'text-muted-foreground',
          )}
        >
          {formatRelativeTime(message.created_at)}
        </div>
      </div>
    </div>
  );
}
