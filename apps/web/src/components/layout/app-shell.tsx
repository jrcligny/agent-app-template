import type { ReactNode } from "react";

export function AppShell({
  health,
  account,
  children,
}: {
  health: ReactNode;
  account?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold">Notes</p>
            <p className="text-sm text-muted">Private notes for people with an account.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {health}
            {account}
          </div>
        </div>
      </header>
      <main id="content" className="mx-auto grid w-full max-w-3xl gap-6 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
