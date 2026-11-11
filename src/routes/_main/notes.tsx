import { createFileRoute } from "@tanstack/react-router";

import { notesQueries } from "@/queries/notes";

import NotesLoading from "@/components/notes/NotesLoading";
import NotesSection from "@/components/notes/NotesSection";

export const Route = createFileRoute("/_main/notes")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      notesQueries.bySession(context.user.id, ""),
    );
  },
  head: () => ({
    meta: [
      { title: "Notes | ScholaFlow" },
      {
        name: "description",
        content:
          "Organize your thoughts and ideas. Take notes, track progress, and enhance your understanding with this dedicated learning space.",
      },
    ],
  }),
  pendingComponent: NotesLoading,
  component: NotesSection,
});
