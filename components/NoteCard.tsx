import Image from "next/image";
import { useState } from "react";

import { formatDate } from "@/lib/utils";
import { Note, Session } from "@/lib/schema";

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
    <li className="mb-2 w-full break-inside-avoid break-all rounded-xl border bg-card shadow-sm">
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
                className="mb-0.5 w-auto select-none break-inside-avoid rounded-md object-cover"
              />
            ))}
          </div>
        ) : null}
        {note.title && (
          <h6 className="font-medium text-foreground">{note.title}</h6>
        )}
        <div className="grid gap-1">
          {note.content?.length ? (
            <p className="whitespace-pre-line text-foreground/90">
              {(() => {
                try {
                  const editorState = JSON.parse(note.content);
                  const textContent =
                    editorState.root?.children
                      ?.map(
                        (node: {
                          type?: string;
                          tag?: string;
                          children?: Array<{ text?: string }>;
                        }) => {
                          if (node.type === "heading") {
                            const headingText =
                              node.children
                                ?.map(
                                  (child: { text?: string }) =>
                                    child.text || "",
                                )
                                .join("") || "";
                            return headingText;
                          }
                          return (
                            node.children
                              ?.map(
                                (child: { text?: string }) => child.text || "",
                              )
                              .join("") || ""
                          );
                        },
                      )
                      .join("\n") || "";
                  return textContent.length > 250
                    ? textContent.slice(0, 250).concat("...")
                    : textContent;
                } catch {
                  return note.content.length > 250
                    ? note.content.slice(0, 250).concat("...")
                    : note.content;
                }
              })()}
            </p>
          ) : null}
          <p className="text-xs text-foreground/70">
            {formatDate(note.createdAt)}
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
