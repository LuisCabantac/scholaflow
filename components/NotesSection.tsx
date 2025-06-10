"use client";

import toast from "react-hot-toast";
import { PlusIcon } from "lucide-react";
import { useOptimistic, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Note, Session } from "@/lib/schema";
import { deleteNote } from "@/lib/notes-actions";

import NoteForm from "@/components/NoteForm";
import NoteCard from "@/components/NoteCard";
import NoNotes from "@/components/NoNotes";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";

export default function NotesSection({
  session,
  onGetNotes,
}: {
  session: Session;
  onGetNotes: (query: string) => Promise<Note[] | null>;
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
          <Input
            type="search"
            placeholder="Search..."
            className="w-[60%] md:w-[50%]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={handleToggleShowNotesForm}>
            <PlusIcon className="h-12 w-12" />
            New note
          </Button>
        </div>
      </div>
      {notesIsPending && (
        <ul className="mt-2 columns-2 gap-2 md:columns-4" role="status">
          <li className="sr-only">Loading…</li>
          <li className="mb-2 w-full break-inside-avoid break-all rounded-md border bg-card p-3 md:p-4">
            <div className="grid gap-2">
              <div className="h-4 w-28 animate-pulse rounded-md bg-muted"></div>
              <div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
                <div className="mt-1 h-[0.875rem] w-20 animate-pulse rounded-md bg-muted"></div>
              </div>
            </div>
          </li>
          <li className="mb-2 w-full break-inside-avoid break-all rounded-md border bg-card p-3 md:p-4">
            <div className="grid gap-2">
              <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
              <div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
              </div>
            </div>
          </li>
          <li className="mb-2 w-full break-inside-avoid break-all rounded-md border bg-card p-3 md:p-4">
            <div className="grid gap-2">
              <div className="h-4 w-20 animate-pulse rounded-md bg-muted"></div>
              <div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
                <div className="mt-1 h-[0.875rem] w-20 animate-pulse rounded-md bg-muted"></div>
              </div>
            </div>
          </li>
          <li className="mb-2 w-full break-inside-avoid break-all rounded-md border bg-card p-3 md:p-4">
            <div className="grid gap-2">
              <div className="h-4 w-20 animate-pulse rounded-md bg-muted"></div>
              <div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>

                <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
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
                  key={note.id}
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
                  key={note.id}
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
