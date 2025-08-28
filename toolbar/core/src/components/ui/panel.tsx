import { cn } from '@/utils';
import type { ReactNode } from 'react';
import { Glassy } from './glassy';

function Panel({
  children,
  alwaysFullHeight = false,
  className,
}: {
  children?: ReactNode;
  alwaysFullHeight?: boolean;
  className?: string;
}) {
  return (
    <Glassy
      as="section"
      className={cn(
        'pointer-events-auto flex max-h-full min-h-48 flex-col items-stretch justify-start rounded-3xl',
        alwaysFullHeight && 'h-full',
        className,
      )}
    >
      {children}
    </Glassy>
  );
}

function PanelHeader({
  title,
  description,
  iconArea,
  actionArea,
  className,
}: {
  title?: string | ReactNode;
  description?: string | ReactNode;
  iconArea?: ReactNode;
  actionArea?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'flex w-auto flex-row items-center justify-between gap-2 rounded-t-[inherit] border-zinc-500/15 border-b bg-white pt-3 pr-3 pb-2 pl-4 text-black dark:bg-black dark:text-white',
        className,
      )}
    >
      {iconArea}
      <div className="flex flex-1 flex-col">
        {title && <h3 className="font-medium text-lg">{title}</h3>}
        {description && <p className="font-medium">{description}</p>}
        {}
      </div>
      {actionArea}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-px w-full bg-gradient-to-r from-white/10 via-white/30 to-white/10" />
    </header>
  );
}

export interface PanelContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

function PanelContent({ children, className, ...props }: PanelContentProps) {
  return (
    <div
      {...props}
      className={cn(
        'flex flex-1 flex-col gap-2 overflow-y-auto bg-white px-4 py-4 text-black/80 dark:bg-black dark:text-white/80',
        className,
      )}
    >
      {children}
    </div>
  );
}

function PanelFooter({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <footer
      className={cn(
        'rounded-b-[inherit] border-zinc-500/15 border-t bg-background/95 pt-2 pr-3 pb-3 pl-4 text-foreground text-sm',
        className,
      )}
    >
      <div className="absolute top-0 right-0 left-0 h-px w-full" />
      {children}
    </footer>
  );
}

export { Panel, PanelContent, PanelFooter, PanelHeader };
