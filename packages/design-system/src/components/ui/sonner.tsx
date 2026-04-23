import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';

// Wrapper that picks up our theme tokens. Pass `theme="system" | "light" | "dark"`.
//
// `richColors` gives sonner's built-in variant backgrounds — green for
// `toast.success`, red for `toast.error`, orange/amber for `toast.warning`.
// Each variant also gets a leading icon automatically (check / alert / warn).
// `closeButton` surfaces an X so users can dismiss toasts explicitly.
export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
}

export { toast } from 'sonner';
