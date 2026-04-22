import { Link } from '@tanstack/react-router';
import { Zap } from 'lucide-react';
import { APP_NAME } from '@forge/shared';
import { Card, CardContent } from '@forge/design-system';
import type { ReactNode } from 'react';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-6 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <Zap className="size-4" />
          </span>
          {APP_NAME}
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle ? (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          <Card>
            <CardContent className="p-6">{children}</CardContent>
          </Card>
          {footer ? <div className="text-center">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
