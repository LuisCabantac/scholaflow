import { queryOptions } from "@tanstack/react-query";

import {
  getAllNotesBySessionQueryFn,
  getAllNotesSessionFn,
} from "@/server/functions/notes";

export const notesKeys = {
  all: ["notes"] as const,
  bySession: (query: string) => [...notesKeys.all, "bySession", query] as const,
};

export const notesQueries = {
  bySession: (query: string) =>
    queryOptions({
      queryKey: notesKeys.bySession(query),
      queryFn: () =>
        query
          ? getAllNotesBySessionQueryFn({ data: query })
          : getAllNotesSessionFn(),
    }),
};
