import { toast } from "sonner";
import { useState } from "react";
import { Pen, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { Note } from "@/lib/schema";
import { splitPinned } from "@/lib/notes";
import { deleteNoteFn } from "@/server/functions/notes";
import { notesKeys, notesQueries } from "@/queries/notes";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NoNotes from "@/components/notes/NoNotes";
import NoteCard from "@/components/notes/NoteCard";
import NoteForm from "@/components/notes/NoteForm";
import NotesLoading from "@/components/notes/NotesLoading";

export default function NotesSection() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("notes");

  const [search, setSearch] = useState("");
  const [showNotesForm, setShowNotesForm] = useState(false);

  const query = useDebouncedValue(search.trim());

  const { data: notes, isPending } = useQuery({
    ...notesQueries.bySession(query),
    placeholderData: keepPreviousData,
  });

  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => {
      const result = await deleteNoteFn({ data: noteId });
      if (!result.success) throw new Error(result.message);
    },
    onMutate: async (noteId) => {
      const key = notesKeys.bySession(query);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Note[] | null>(key);
      queryClient.setQueryData<Note[] | null>(key, (current) =>
        current?.filter((note) => note.id !== noteId),
      );
      return { key, previous };
    },
    onError: (error, _noteId, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous);
      toast.error(error.message);
    },
    onSuccess: () => toast.success(t("messages.deleted")),
    onSettled: () => queryClient.invalidateQueries({ queryKey: notesKeys.all }),
  });

  const { pinned, others } = splitPinned(notes);

  return (
    <section>
      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="notes-search"
            className="group bg-foreground/10 focus-within:border-ring flex w-[60%] items-center gap-2 rounded-full border text-sm md:w-[50%]"
          >
            <Search className="stroke-muted-foreground mb-0.5 ml-3 h-5 w-5 md:h-4 md:w-4" />
            <Input
              type="search"
              id="notes-search"
              placeholder={t("search")}
              className="mb-0.5 border-0 bg-transparent pl-0 shadow-none drop-shadow-none focus-visible:ring-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <Button onClick={() => setShowNotesForm((prev) => !prev)}>
            <Pen className="h-12 w-12" />
            {t("newNote")}
          </Button>
        </div>
      </div>
      {isPending && <NotesLoading listOnly />}
      {!isPending && pinned.length ? (
        <div className="mt-2 grid gap-1">
          <h4 className="text-foreground font-medium">{t("pinned")}</h4>
          <ul className="columns-2 gap-2 md:columns-4">
            {pinned.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDeleteNote={deleteNote.mutate}
                deleteNoteIsPending={deleteNote.isPending}
              />
            ))}
          </ul>
        </div>
      ) : null}
      {!isPending && others.length ? (
        <div className="mt-2 grid gap-1">
          {pinned.length ? (
            <h4 className="font-medium">{t("others")}</h4>
          ) : null}
          <ul className="columns-2 gap-2 md:columns-4">
            {others.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDeleteNote={deleteNote.mutate}
                deleteNoteIsPending={deleteNote.isPending}
              />
            ))}
          </ul>
        </div>
      ) : null}
      {!isPending && !notes?.length ? <NoNotes /> : null}
      {showNotesForm && (
        <NoteForm
          type="create"
          onDeleteNote={deleteNote.mutate}
          deleteNoteIsPending={deleteNote.isPending}
          onClose={() => setShowNotesForm(false)}
        />
      )}
    </section>
  );
}
