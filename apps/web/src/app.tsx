import { NavLink, Outlet } from "react-router";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/feedback/status";
import { AppShell } from "@/components/layout/app-shell";
import { AuthPanel } from "@/features/auth/auth-panel";
import { authClient } from "@/lib/auth-client";

export function App() {
  const session = authClient.useSession();
  const user = session.data?.user;

  return (
    <AppShell
      account={
        user ? (
          <div className="flex min-w-0 items-center gap-2">
            <p className="max-w-28 truncate sm:max-w-56">{user.email}</p>
            <Button
              variant="quiet"
              onClick={() => {
                void authClient.signOut();
              }}
            >
              Sign out
            </Button>
          </div>
        ) : null
      }
      nav={
        user ? (
          <nav aria-label="Primary" className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            <PrimaryLink to="/" end>
              Dashboard
            </PrimaryLink>
            <PrimaryLink to="/records">Records</PrimaryLink>
            <PrimaryLink to="/collections">Collections</PrimaryLink>
            <PrimaryLink to="/analytics">Analytics</PrimaryLink>
            <PrimaryLink to="/activity">Activity</PrimaryLink>
            <PrimaryLink to="/settings">Settings</PrimaryLink>
          </nav>
        ) : null
      }
    >
      {session.isPending ? <Status tone="loading" title="Checking your session" /> : null}
      {session.error ? <Status tone="error" title="Could not check your session" /> : null}
      {!session.isPending && !session.error && !user ? <AuthPanel /> : null}
      {!session.isPending && !session.error && user ? <Outlet /> : null}
    </AppShell>
  );
}

function PrimaryLink({ to, end, children }: { to: string; end?: boolean; children: string }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => (isActive ? "font-semibold underline decoration-accent" : "underline decoration-accent")}
    >
      {children}
    </NavLink>
  );
}
