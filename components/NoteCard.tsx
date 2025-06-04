import { useState } from "react";
import Image from "next/image";

import { Note, Session } from "@/lib/schema";
import { formatDate } from "@/lib/utils";

import NoteForm from "@/components/NoteForm";

export default function NoteCard({
  note,
  session,
  onDeleteNote,
  deleteNoteIsPending,
}: {
  note: Note;
  session: Session;
  onDeleteNote: (noteId: string) => void;
  deleteNoteIsPending: boolean;
}) {
  const [showNotesForm, setShowNotesForm] = useState(false);

  function handleToggleShowNotesForm() {
    setShowNotesForm(!showNotesForm);
  }

  return (
    <li className="mb-2 w-full break-inside-avoid break-all rounded-md border border-[#dddfe6] bg-[#f3f6ff] shadow-sm">
      <div
        onClick={handleToggleShowNotesForm}
        className="grid cursor-pointer gap-2 p-3 md:p-4"
      >
        {note.attachments.length ? (
          <div className="columns-2 gap-0.5">
            {note.attachments.slice(0, 4).map((image) => (
              <Image
                key={image}
                src={image}
                alt={`${image}`}
                width={80}
                height={20}
                className="mb-0.5 w-auto break-inside-avoid rounded-md object-cover"
              />
            ))}
          </div>
        ) : null}
        {note.title && <h6 className="font-medium">{note.title}</h6>}
        <div className="grid gap-1">
          {note.content?.length ? (
            <p className="whitespace-pre-line">
              {note.content.length > 250
                ? note.content.slice(0, 250).concat("...")
                : note.content}
            </p>
          ) : null}
          <p className="text-xs text-[#616572]">{formatDate(note.createdAt)}</p>
        </div>
      </div>
      {showNotesForm && (
        <NoteForm
          type="edit"
          note={note}
          session={session}
          onDeleteNote={onDeleteNote}
          onSetShowNotesForm={setShowNotesForm}
          deleteNoteIsPending={deleteNoteIsPending}
          onToggleShowNotesForm={handleToggleShowNotesForm}
        />
      )}
    </li>
  );
}
