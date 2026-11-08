import { noteListSchema, noteSchema, type Note } from "@agent-app/contracts";
import { useEffect, useState, type FormEvent } from "react";
import { Status } from "@/components/feedback/status";
import { ActionRow } from "@/components/ui/action-row";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { ApiError, apiFetch } from "@/lib/api";
import { NoteList } from "./note-list";

export function NotesPage() {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function load() {
    setLoadError(null);
    try {
      const result = await apiFetch("/api/notes", (value) => noteListSchema.parse(value));
      setNotes(result.notes);
    } catch (error) {
      setNotes(null);
      setLoadError(error instanceof ApiError ? error.message : "Could not load notes");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim().length === 0) {
      setTitleError("Enter a title.");
      document.getElementById("note-title")?.focus();
      return;
    }
    setTitleError(null);
    try {
      await apiFetch("/api/notes", (value) => noteSchema.parse(value), {
        method: "POST",
        body: JSON.stringify({ title, body }),
      });
      setTitle("");
      setBody("");
      setFeedback("Note added");
      await load();
    } catch (error) {
      setFeedback(null);
      setLoadError(error instanceof ApiError ? error.message : "Could not add the note");
    }
  }

  async function onDelete(id: string) {
    try {
      await apiFetch(`/api/notes/${id}`, () => undefined, { method: "DELETE" });
      setFeedback("Note deleted");
      await load();
    } catch (error) {
      setFeedback(null);
      setLoadError(error instanceof ApiError ? error.message : "Could not delete the note");
    }
  }

  return (
    <section className="grid gap-6" aria-labelledby="notes-heading">
      <div className="grid gap-2">
        <h1 id="notes-heading" className="text-2xl font-semibold">
          Your notes
        </h1>
        <p className="text-sm text-muted">Only you can see the notes on this account.</p>
      </div>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <TextField
          id="note-title"
          label="Title"
          value={title}
          error={titleError ?? undefined}
          onChange={(event) => setTitle(event.target.value)}
        />
        <TextField
          id="note-body"
          label="Body"
          multiline
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <ActionRow>
          <Button type="submit">Add note</Button>
        </ActionRow>
      </form>
      {feedback ? <Status tone="success" title={feedback} /> : null}
      {loadError ? <Status tone="error" title={loadError} /> : null}
      {notes === null && !loadError ? <Status tone="loading" title="Loading notes" /> : null}
      {notes && notes.length === 0 ? (
        <Status tone="empty" title="No notes yet" detail="Notes you add stay on your account." />
      ) : null}
      {notes && notes.length > 0 ? <NoteList notes={notes} onDelete={onDelete} /> : null}
    </section>
  );
}
