import { useTranslation } from "react-i18next";

const rows = [
  ["r1a w-32", "r1b w-24", "r1c w-full"],
  ["r2a w-full", "r2b w-full", "r2c w-24"],
  ["r3a w-full", "r3b w-full", "r3c w-24"],
  ["r4a w-full", "r4b w-24", "r4c w-80", "r4d w-full"],
  ["r5a w-full", "r5b w-full", "r5c w-80", "r5d w-24"],
  ["r6a w-32", "r6b w-24", "r6c w-full"],
  ["r7a w-full", "r7b w-80", "r7c w-full"],
  ["r8a w-full", "r8b w-full", "r8c w-24"],
];

export default function StreamDetailLoading() {
  const { t } = useTranslation("common");

  return (
    <output className="flex items-start gap-2">
      <span className="sr-only">{t("loading")}</span>
      <div className="relative w-full">
        <div className="flex items-center gap-2">
          <div className="bg-muted size-5 animate-pulse rounded-md" />
        </div>
        <div className="mt-2 mb-3 flex gap-1">
          <div className="bg-muted size-10 shrink-0 animate-pulse rounded-full" />
          <div className="grid w-full gap-2">
            <div className="bg-muted h-4 w-44 animate-pulse rounded-md" />
            <div className="bg-muted h-3 w-24 animate-pulse rounded-md" />
          </div>
        </div>
        <div className="w-full animate-pulse space-y-2.5">
          {rows.map((row) => (
            <div key={row[0]} className="flex w-full items-center">
              {row.map((cell) => (
                <div
                  key={cell}
                  className={`bg-muted h-[0.875rem] rounded-full ${cell.split(" ")[1]} ${cell === row[0] ? "" : "ms-2"}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </output>
  );
}
