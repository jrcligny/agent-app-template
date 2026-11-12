import { useState, type FormEvent } from "react";
import { ActionRow } from "@/components/ui/action-row";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Status } from "@/components/feedback/status";
import { authClient } from "@/lib/auth-client";

type Mode = "sign-in" | "sign-up";

export function AuthPanel() {
  const [mode, setMode] = useState<Mode>("sign-up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (email.trim().length === 0) {
      document.getElementById("email")?.focus();
      setError("Enter an email.");
      return;
    }
    if (password.trim().length === 0) {
      document.getElementById("password")?.focus();
      setError("Enter a password.");
      return;
    }
    setPending(true);
    const result =
      mode === "sign-up"
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password });
    setPending(false);
    if (result.error) {
      setError(result.error.message ?? "Sign-in failed");
      document.getElementById("auth-error")?.focus();
    }
  }

  return (
    <section className="grid gap-4" aria-labelledby="auth-heading">
      <h1 id="auth-heading" className="text-2xl font-semibold">
        {mode === "sign-up" ? "Create an account" : "Sign in"}
      </h1>
      <div role="tablist" aria-label="Account access" className="flex gap-2">
        <Button
          role="tab"
          aria-selected={mode === "sign-up"}
          variant={mode === "sign-up" ? "primary" : "quiet"}
          onClick={() => setMode("sign-up")}
        >
          Create account
        </Button>
        <Button
          role="tab"
          aria-selected={mode === "sign-in"}
          variant={mode === "sign-in" ? "primary" : "quiet"}
          onClick={() => setMode("sign-in")}
        >
          Sign in
        </Button>
      </div>
      <form className="grid gap-4" onSubmit={onSubmit}>
        {mode === "sign-up" ? (
          <TextField id="name" label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
        ) : null}
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
        />
        {error ? (
          <div id="auth-error" tabIndex={-1}>
            <Status tone="error" title={error} />
          </div>
        ) : null}
        <ActionRow label="Account actions">
          <Button type="submit" disabled={pending}>
            {pending ? "Please wait" : mode === "sign-up" ? "Create account" : "Sign in"}
          </Button>
        </ActionRow>
      </form>
    </section>
  );
}
