import { Link, Outlet } from "react-router";
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
          <div className="flex items-center gap-3">
            <p>{user.email}</p>
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
          <nav aria-label="Primary" className="flex flex-wrap gap-3 text-sm">
            <Link to="/" className="underline">
              Dashboard
            </Link>
            <Link to="/records" className="underline">
              Records
            </Link>
            <Link to="/notes" className="underline">
              Notes
            </Link>
            <Link to="/wizard" className="underline">
              Wizard
            </Link>
            <Link to="/jobs" className="underline">
              Jobs
            </Link>
            <Link to="/activity" className="underline">
              Activity
            </Link>
            <Link to="/settings" className="underline">
              Settings
            </Link>
            <Link to="/analytics" className="underline">
              Analytics
            </Link>
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
