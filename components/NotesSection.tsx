"use client";

import toast from "react-hot-toast";
import { useOptimistic, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ISession } from "@/lib/auth";
import { deleteNote } from "@/lib/notes-actions";
import { INotes } from "@/app/user/notes/page";

import Button from "@/components/Button";
import NoteForm from "@/components/NoteForm";
import NoteCard from "@/components/NoteCard";
import NoNotes from "@/components/NoNotes";

export default function NotesSection({
  session,
  onGetNotes,
}: {
  session: ISession;
  onGetNotes: (query: string) => Promise<INotes[] | null>;
}) {
  const queryClient = useQueryClient();
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [search, setSearch] = useState("");

  const { data: notes, isPending: notesIsPending } = useQuery({
    queryKey: [`notes--${session.id}`, search],
    queryFn: () => onGetNotes(search),
  });

  const { mutate: deleteUserNote, isPending: deleteNoteIsPending } =
    useMutation({
      mutationFn: deleteNote,
      onSuccess: () => {
        toast.success("Notes removed");

        queryClient.invalidateQueries({
          queryKey: [`notes--${session.id}`, search],
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const [optimisticNotes, optimisticDelete] = useOptimistic(
    notes,
    (curNote, noteId) => {
      return curNote?.filter((note) => note.id !== noteId);
    },
  );

  function handleToggleShowNotesForm() {
    setShowNotesForm(!showNotesForm);
  }

  function handleDeleteNote(noteId: string) {
    optimisticDelete(noteId);
    deleteUserNote(noteId);
  }

  return (
    <section>
      <div>
        <div className="flex items-center justify-between">
          <input
            type="search"
            className="w-[60%] rounded-md border border-[#dddfe6] bg-[#eef3ff] px-4 py-2 shadow-sm placeholder:text-[#616572] focus:border-[#384689] focus:outline-none md:w-[50%]"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="primary" onClick={handleToggleShowNotesForm}>
            New note
          </Button>
        </div>
      </div>
      {notesIsPending && (
        <ul className="mt-2 columns-2 gap-2 md:columns-4" role="status">
          <li className="sr-only">Loading…</li>
          <li className="mb-2 w-full break-inside-avoid break-all rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 md:p-4">
            <div className="grid gap-2">
              <div className="h-4 w-28 animate-pulse rounded-md bg-[#dbe4ff]"></div>
              <div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
                <div className="mt-1 h-[0.875rem] w-20 animate-pulse rounded-md bg-[#dbe4ff]"></div>
              </div>
            </div>
          </li>
          <li className="mb-2 w-full break-inside-avoid break-all rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 md:p-4">
            <div className="grid gap-2">
              <div className="h-4 w-24 animate-pulse rounded-md bg-[#dbe4ff]"></div>
              <div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
              </div>
            </div>
          </li>
          <li className="mb-2 w-full break-inside-avoid break-all rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 md:p-4">
            <div className="grid gap-2">
              <div className="h-4 w-20 animate-pulse rounded-md bg-[#dbe4ff]"></div>
              <div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
                <div className="mt-1 h-[0.875rem] w-20 animate-pulse rounded-md bg-[#dbe4ff]"></div>
              </div>
            </div>
          </li>
          <li className="mb-2 w-full break-inside-avoid break-all rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 md:p-4">
            <div className="grid gap-2">
              <div className="h-4 w-20 animate-pulse rounded-md bg-[#dbe4ff]"></div>
              <div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>

                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
              </div>
            </div>
          </li>
        </ul>
      )}
      {!notesIsPending &&
      optimisticNotes?.filter((note) => note.isPinned).length ? (
        <div className="mt-2 grid gap-1">
          <h4 className="font-medium">Pinned</h4>
          <ul className="columns-2 gap-2 md:columns-4">
            {optimisticNotes
              ?.filter((note) => note.isPinned)
              .map((note) => (
                <NoteCard
                  key={note.created_at}
                  note={note}
                  session={session}
                  onDeleteNote={handleDeleteNote}
                  deleteNoteIsPending={deleteNoteIsPending}
                />
              ))}
          </ul>
        </div>
      ) : null}
      {!notesIsPending &&
      optimisticNotes?.filter((note) => !note.isPinned).length ? (
        <div className="mt-2 grid gap-1">
          {optimisticNotes?.filter((note) => note.isPinned).length ? (
            <h4 className="font-medium">Others</h4>
          ) : null}
          <ul className="columns-2 gap-2 md:columns-4">
            {optimisticNotes
              ?.filter((note) => !note.isPinned)
              .map((note) => (
                <NoteCard
                  key={note.created_at}
                  note={note}
                  session={session}
                  onDeleteNote={handleDeleteNote}
                  deleteNoteIsPending={deleteNoteIsPending}
                />
              ))}
          </ul>
        </div>
      ) : null}
      {!notesIsPending && !notes?.length ? <NoNotes /> : null}
      {showNotesForm && (
        <NoteForm
          type="create"
          session={session}
          onDeleteNote={handleDeleteNote}
          deleteNoteIsPending={deleteNoteIsPending}
          onSetShowNotesForm={setShowNotesForm}
          onToggleShowNotesForm={handleToggleShowNotesForm}
        />
      )}
    </section>
  );
}
