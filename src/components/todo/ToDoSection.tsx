import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useNow } from "@/hooks/use-now";
import type { SessionUser } from "@/types/auth";
import { streamQueries } from "@/queries/stream";
import type { ToDoKind } from "@/types/classroom";
import { classroomQueries } from "@/queries/classroom";
import { classworkQueries } from "@/queries/classwork";
import {
  assignedClassworks,
  doneClassworks,
  missingClassworks,
} from "@/lib/classwork-buckets";

import NoToDo from "@/components/todo/NoToDo";
import ToDoListItem from "@/components/todo/ToDoListItem";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const kinds: ToDoKind[] = ["assigned", "missing", "done"];

export default function ToDoSection({
  user,
  filter,
}: {
  user: SessionUser;
  filter: ToDoKind;
}) {
  const { t } = useTranslation("todo");
  const now = useNow();

  const { data: classworks } = useSuspenseQuery(
    classworkQueries.byUser(user.id),
  );
  const { data: enrolledClasses } = useSuspenseQuery(
    classroomQueries.enrolledByUser(user.id),
  );
  const { data: enrolledClassworks } = useSuspenseQuery(
    streamQueries.enrolledClassworks(user.id),
  );

  const assigned = assignedClassworks(
    enrolledClassworks,
    classworks,
    user.id,
    now,
  );
  const missing = missingClassworks(
    enrolledClassworks,
    classworks,
    user.id,
    now,
  );
  const done = doneClassworks(classworks, enrolledClasses);

  const isEmpty =
    (filter === "assigned" && !assigned.length) ||
    (filter === "missing" && !missing.length) ||
    (filter === "done" && !done.length);

  return (
    <section className="flex flex-col items-start justify-start">
      <Tabs value={filter}>
        <TabsList>
          {kinds.map((kind) => (
            <TabsTrigger key={kind} value={kind} asChild>
              <Link to="/to-do" search={{ filter: kind }}>
                {t(kind)}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <ul className="mt-2 grid w-full gap-2">
        {filter === "assigned" &&
          assigned.map((item) => (
            <ToDoListItem key={item.id} kind="assigned" item={item} />
          ))}
        {filter === "missing" &&
          missing.map((item) => (
            <ToDoListItem key={item.id} kind="missing" item={item} />
          ))}
        {filter === "done" &&
          done.map((item) => (
            <ToDoListItem key={item.id} kind="done" item={item} />
          ))}
        {isEmpty && <NoToDo kind={filter} />}
      </ul>
    </section>
  );
}
