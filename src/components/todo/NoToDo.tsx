import { useTranslation } from "react-i18next";

import type { ToDoKind } from "@/types/classroom";

const images: Record<ToDoKind, string> = {
  assigned: "/app/no_assigned.svg",
  missing: "/app/no_missing.svg",
  done: "/app/no_done.svg",
};

export default function NoToDo({ kind }: { kind: ToDoKind }) {
  const { t } = useTranslation("todo", { keyPrefix: "empty" });

  return (
    <div className="flex h-[30rem] w-full flex-col items-center justify-center gap-3 md:h-[25rem] md:gap-2">
      <div className="relative w-[15rem] md:w-[20rem]">
        <img
          src={images[kind]}
          alt={t(`${kind}Alt`)}
          className="object-cover select-none"
        />
      </div>
      <p className="font-medium md:text-lg">{t(kind)}</p>
    </div>
  );
}
