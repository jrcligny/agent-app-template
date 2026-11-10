import type { ReactNode } from "react";
import { ThemeSwitch } from "@/components/theme/theme-switch";

export function AppShell({
  account,
  nav,
  children,
}: {
  account?: ReactNode;
  nav?: ReactNode;
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
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold">Workbench</p>
            <p className="text-sm text-muted">Synthetic records for people with an account.</p>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            {nav}
            <div className="ml-auto flex min-w-0 items-center gap-2">
              <ThemeSwitch />
              {account}
            </div>
          </div>
        </div>
      </header>
      <main id="content" className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
