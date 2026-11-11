import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { ToDoKind } from "@/types/classroom";
import type { Classwork, Stream } from "@/lib/schema";

import ToDoItem from "@/components/classroom/ToDoItem";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ToDoCard({
  assigned,
  missing,
  done,
}: {
  assigned: Stream[];
  missing: Stream[];
  done: Classwork[];
}) {
  const { t } = useTranslation("classroom", { keyPrefix: "todo" });

  const [filter, setFilter] = useState<ToDoKind>("assigned");

  const emptyKey =
    filter === "assigned"
      ? "emptyAssigned"
      : filter === "missing"
        ? "emptyMissing"
        : "emptyDone";
  const isEmpty =
    (filter === "assigned" && !assigned.length) ||
    (filter === "missing" && !missing.length) ||
    (filter === "done" && !done.length);

  return (
    <Card className="hidden w-[18rem] md:block">
      <CardHeader className="px-4 pt-4 pb-0 text-lg font-medium tracking-tight">
        {t("title")}
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="assigned" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assigned" onClick={() => setFilter("assigned")}>
              {t("assigned")}
            </TabsTrigger>
            <TabsTrigger value="missing" onClick={() => setFilter("missing")}>
              {t("missing")}
            </TabsTrigger>
            <TabsTrigger value="done" onClick={() => setFilter("done")}>
              {t("done")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <ul className="mt-2 grid w-full gap-2">
          {filter === "assigned" &&
            assigned.map((item) => (
              <ToDoItem key={item.id} kind="assigned" item={item} />
            ))}
          {filter === "missing" &&
            missing.map((item) => (
              <ToDoItem key={item.id} kind="missing" item={item} />
            ))}
          {filter === "done" &&
            done.map((item) => (
              <ToDoItem key={item.id} kind="done" item={item} />
            ))}
          {isEmpty && (
            <p className="flex h-[10rem] items-center justify-center text-center font-medium">
              {t(emptyKey)}
            </p>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
