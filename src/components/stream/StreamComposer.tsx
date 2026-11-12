import { useTranslation } from "react-i18next";

import type { SessionUser } from "@/types/auth";

export default function StreamComposer({
  user,
  onOpen,
}: {
  user: SessionUser;
  onOpen: () => void;
}) {
  const { t } = useTranslation("stream", { keyPrefix: "composer" });

  return (
    <button
      type="button"
      className="border-border bg-card flex w-full items-center gap-3 rounded-xl border p-3 text-left shadow-sm md:p-4"
      onClick={onOpen}
    >
      <img
        src={user.image ?? ""}
        alt={t("avatarAlt")}
        width={40}
        height={40}
        className="h-8 w-8 shrink-0 rounded-full md:h-10 md:w-10"
        onDragStart={(event) => event.preventDefault()}
      />
      <p className="bg-foreground/10 text-muted-foreground w-full rounded-xl py-2 pl-4 md:p-3 md:pl-3">
        {t("placeholder")}
      </p>
    </button>
  );
}
