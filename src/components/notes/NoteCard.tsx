import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ClientOnly } from "@tanstack/react-router";

import { formatDate } from "@/lib/utils";
import type { Note } from "@/lib/schema";
import { notePreview } from "@/lib/notes";

import NoteForm from "@/components/notes/NoteForm";

export default function NoteCard({
  note,
  onDeleteNote,
  deleteNoteIsPending,
}: {
  note: Note;
  onDeleteNote: (noteId: string) => void;
  deleteNoteIsPending: boolean;
}) {
  const { t } = useTranslation("notes", { keyPrefix: "card" });

  const [showNotesForm, setShowNotesForm] = useState(false);

  const preview = notePreview(note.content);

  return (
    <li className="bg-card mb-2 w-full break-inside-avoid rounded-xl border break-all shadow-sm">
      <button
        type="button"
        onClick={() => setShowNotesForm(true)}
        className="grid w-full cursor-pointer gap-2 p-3 text-left md:p-4"
      >
        {note.attachments.length ? (
          <div className="columns-2 gap-0.5">
            {note.attachments.slice(0, 4).map((image) => (
              <img
                key={image}
                src={image}
                alt={image}
                width={80}
                height={20}
                className="mb-0.5 w-auto break-inside-avoid rounded-md object-cover select-none"
              />
            ))}
          </div>
        ) : null}
        {note.title && (
          <h6 className="text-foreground font-medium">{note.title}</h6>
        )}
        <div className="grid gap-1">
          {preview ? (
            <p className="text-foreground/90 whitespace-pre-line">{preview}</p>
          ) : null}
          <ClientOnly
            fallback={<p className="text-foreground/70 h-4 text-xs" />}
          >
            <p className="text-foreground/70 text-xs">
              {note.updatedAt
                ? t("updated", { date: formatDate(note.updatedAt) })
                : t("created", { date: formatDate(note.createdAt) })}
            </p>
          </ClientOnly>
        </div>
      </button>
      {showNotesForm && (
        <NoteForm
          type="edit"
          note={note}
          onDeleteNote={onDeleteNote}
          deleteNoteIsPending={deleteNoteIsPending}
          onClose={() => setShowNotesForm(false)}
        />
      )}
    </li>
  );
}
