import { queryOptions } from "@tanstack/react-query";

import {
  getAllNotesBySessionQueryFn,
  getAllNotesSessionFn,
} from "@/server/functions/notes";

export const notesKeys = {
  all: ["notes"] as const,
  bySession: (userId: string, query: string) =>
    [...notesKeys.all, "bySession", userId, query] as const,
};

export const notesQueries = {
  bySession: (userId: string, query: string) =>
    queryOptions({
      queryKey: notesKeys.bySession(userId, query),
      queryFn: () =>
        query
          ? getAllNotesBySessionQueryFn({ data: query })
          : getAllNotesSessionFn(),
    }),
};
