import type { TFunction } from "i18next";

import type { Classwork, Stream } from "@/lib/schema";

export type ClassroomSort =
  | "all-classes"
  | "created-classes"
  | "enrolled-classes";

export type ToDoKind = "assigned" | "missing" | "done";

export type ToDoTranslator = TFunction<"classroom", "todo">;

export type ToDoItemProps =
  | { kind: "assigned" | "missing"; item: Stream }
  | { kind: "done"; item: Classwork };
