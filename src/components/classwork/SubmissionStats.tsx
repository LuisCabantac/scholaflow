import { useTranslation } from "react-i18next";

import type { SubmissionCounts } from "@/types/stream";

export default function SubmissionStats({
  counts,
}: {
  counts: SubmissionCounts;
}) {
  const { t } = useTranslation("classwork", { keyPrefix: "submissions" });

  return (
    <div className="bg-card flex items-center justify-around rounded-xl border p-3 shadow-sm">
      <div>
        <p className="text-2xl font-semibold">{counts.turnedIn}</p>
        <h4 className="text-foreground/70 text-xs font-medium">
          {t("turnedIn")}
        </h4>
      </div>
      <div className="bg-border mx-4 h-8 w-px" />
      <div>
        <p className="text-2xl font-semibold">{counts.assigned}</p>
        <h4 className="text-foreground/70 text-xs font-medium">
          {t("assigned")}
        </h4>
      </div>
      <div className="bg-border mx-4 h-8 w-px" />
      <div>
        <p className="text-2xl font-semibold">{counts.graded}</p>
        <h4 className="text-foreground/70 text-xs font-medium">
          {t("graded")}
        </h4>
      </div>
    </div>
  );
}
