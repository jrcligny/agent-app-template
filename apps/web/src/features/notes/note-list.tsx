import type { Note } from "@agent-app/contracts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function NoteList({ notes, onDelete }: { notes: Note[]; onDelete: (id: string) => void }) {
  return (
    <ul className="grid gap-3">
      {notes.map((note) => (
        <li key={note.id}>
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{note.title}</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{note.body}</p>
              </div>
              <Button variant="danger" onClick={() => onDelete(note.id)}>
                Delete {note.title}
              </Button>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
