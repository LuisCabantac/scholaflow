import { useTranslation } from "react-i18next";
import { validate as validateUUID } from "uuid";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";

import { classroomQueries } from "@/queries/classroom";
import { extractFirstUuid, getLastRouteName } from "@/lib/utils";

const titleClass =
  "text-foreground overflow-hidden text-xl font-semibold text-ellipsis whitespace-nowrap md:text-2xl";

const sectionTitleKeys = {
  classroom: "classroom",
  "to-do": "todo",
  notes: "notes",
  notifications: "notifications",
  profile: "profile",
  "user-management": "userManagement",
} as const;

export default function HeaderTitle() {
  const { pathname } = useLocation();
  const { t } = useTranslation("layout", { keyPrefix: "header" });

  const classId = extractFirstUuid(pathname);
  const isValidClassId = typeof classId === "string" && validateUUID(classId);

  const { data: classroom } = useQuery({
    ...classroomQueries.byId(classId ?? ""),
    enabled: isValidClassId,
  });

  if (pathname.includes("/classroom/class/")) {
    return <h1 className={titleClass}>{classroom?.name ?? t("classroom")}</h1>;
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "";
  const key =
    firstSegment in sectionTitleKeys
      ? sectionTitleKeys[firstSegment as keyof typeof sectionTitleKeys]
      : null;

  return (
    <h1 className={titleClass}>{key ? t(key) : getLastRouteName(pathname)}</h1>
  );
}
