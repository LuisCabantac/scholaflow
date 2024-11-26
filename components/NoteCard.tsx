import { useState } from "react";
import Image from "next/image";

import { INotes } from "@/app/user/notes/page";
import { formatDate } from "@/lib/utils";

import NoteForm from "@/components/NoteForm";
import { ISession } from "@/lib/auth";

export default function NoteCard({
  note,
  session,
  onDeleteNote,
  deleteNoteIsPending,
}: {
  note: INotes;
  session: ISession;
  onDeleteNote: (noteId: string) => void;
  deleteNoteIsPending: boolean;
}) {
  const [showNotesForm, setShowNotesForm] = useState(false);

  function handleToggleShowNotesForm() {
    setShowNotesForm(!showNotesForm);
  }

  return (
    <li className="mb-2 w-full break-inside-avoid break-all rounded-md border-2 border-[#dbe4ff] bg-[#f3f6ff]">
      <div
        onClick={handleToggleShowNotesForm}
        className="grid cursor-pointer gap-2 p-3 md:p-4"
      >
        {note.attachment.length ? (
          <div className="columns-2 gap-0.5">
            {note.attachment.slice(0, 4).map((image) => (
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
          {note.description.length ? (
            <p className="whitespace-pre-line">
              {note.description.length > 250
                ? note.description.slice(0, 250).concat("...")
                : note.description}
            </p>
          ) : null}
          <p className="text-xs text-[#616572]">
            {formatDate(note.created_at)}
          </p>
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
