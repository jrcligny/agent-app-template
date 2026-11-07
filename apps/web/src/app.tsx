import { Button } from "@/components/ui/button";
import { Status } from "@/components/feedback/status";
import { AppShell } from "@/components/layout/app-shell";
import { AuthPanel } from "@/features/auth/auth-panel";
import { HealthBadge } from "@/features/health/health-badge";
import { NotesPage } from "@/features/notes/notes-page";
import { authClient } from "@/lib/auth-client";

export function App() {
  const session = authClient.useSession();
  const user = session.data?.user;

  return (
    <AppShell
      health={<HealthBadge />}
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
    >
      {session.isPending ? <Status tone="loading" title="Checking your session" /> : null}
      {session.error ? <Status tone="error" title="Could not check your session" /> : null}
      {!session.isPending && !session.error && !user ? <AuthPanel /> : null}
      {!session.isPending && !session.error && user ? <NotesPage /> : null}
    </AppShell>
  );
}
