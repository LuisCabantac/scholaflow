import { useTranslation } from "react-i18next";
import { Link, useLocation } from "@tanstack/react-router";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = ["stream", "classwork", "people", "chat"] as const;

export default function ClassTabs({ classId }: { classId: string }) {
  const { pathname } = useLocation();
  const { t } = useTranslation("stream", { keyPrefix: "tabs" });

  const base = `/classroom/class/${classId}`;
  const active =
    tabs.find(
      (tab) => tab !== "stream" && pathname.startsWith(`${base}/${tab}`),
    ) ?? "stream";

  return (
    <div className="flex items-center justify-between pb-2">
      <Tabs value={active}>
        <TabsList>
          <TabsTrigger value="stream" asChild>
            <Link to="/classroom/class/$classId" params={{ classId }}>
              {t("stream")}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="classwork" asChild>
            <Link to="/classroom/class/$classId/classwork" params={{ classId }}>
              {t("classwork")}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="people" asChild>
            <Link to="/classroom/class/$classId/people" params={{ classId }}>
              {t("people")}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="chat" asChild>
            <Link to="/classroom/class/$classId/chat" params={{ classId }}>
              {t("chat")}
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
