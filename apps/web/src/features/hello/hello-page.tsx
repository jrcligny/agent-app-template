export function HelloPage() {
  return (
    <section className="grid gap-2" aria-labelledby="hello-heading">
      <h1 id="hello-heading" className="text-2xl font-semibold">
        Hello world
      </h1>
      <p className="text-sm text-muted">You are signed in to Workbench.</p>
    </section>
  );
}
