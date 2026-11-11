import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Check, ClipboardList } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function ToDoStrip({
  assignedCount,
  missingCount,
  doneCount,
}: {
  assignedCount: number;
  missingCount: number;
  doneCount: number;
}) {
  const { t } = useTranslation("classroom", { keyPrefix: "todo" });

  return (
    <Card className="mt-2 md:hidden">
      <CardContent className="flex items-center justify-between p-4">
        <Link
          to="/to-do"
          search={{ filter: "assigned" }}
          className="flex items-center gap-2"
        >
          <ClipboardList className="h-12 w-12" strokeWidth={1.3} />
          <div>
            <span className="text-foreground/70 text-[0.65rem]">
              {t("assigned")}
            </span>
            <p className="text-3xl font-semibold">{assignedCount}</p>
          </div>
        </Link>
        <Link
          to="/to-do"
          search={{ filter: "missing" }}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="h-12 w-12" strokeWidth={1.3} />
          <div>
            <span className="text-foreground/70 text-[0.65rem]">
              {t("missing")}
            </span>
            <p className="text-3xl font-semibold">{missingCount}</p>
          </div>
        </Link>
        <Link
          to="/to-do"
          search={{ filter: "done" }}
          className="mr-2 flex items-center gap-2"
        >
          <Check className="h-12 w-12" strokeWidth={1.3} />
          <div>
            <span className="text-foreground/70 text-[0.65rem]">
              {t("done")}
            </span>
            <p className="text-3xl font-semibold">{doneCount}</p>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
