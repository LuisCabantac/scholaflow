import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ClientOnly } from "@tanstack/react-router";

import { formatDate } from "@/lib/utils";
import { useNow } from "@/hooks/use-now";
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
  const now = useNow();

  const [showNotesForm, setShowNotesForm] = useState(false);

  const preview = notePreview(note.content);

  return (
    <li className="bg-card mb-2 w-full break-inside-avoid rounded-xl border break-all shadow-sm">
      <button
        type="button"
        onClick={() => setShowNotesForm(true)}
        className="grid w-full gap-2 p-3 text-left md:p-4"
      >
        {note.attachments.length ? (
          <span className="block columns-2 gap-0.5">
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
          </span>
        ) : null}
        {note.title && (
          <span className="text-foreground block font-medium">
            {note.title}
          </span>
        )}
        <span className="grid gap-1">
          {preview ? (
            <span className="text-foreground/90 block whitespace-pre-line">
              {preview}
            </span>
          ) : null}
          <ClientOnly
            fallback={<span className="text-foreground/70 block h-4 text-xs" />}
          >
            <span className="text-foreground/70 block text-xs">
              {note.updatedAt
                ? t("updated", { date: formatDate(note.updatedAt, now) })
                : t("created", { date: formatDate(note.createdAt, now) })}
            </span>
          </ClientOnly>
        </span>
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
