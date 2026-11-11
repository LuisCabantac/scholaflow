import { useTranslation } from "react-i18next";

const rows = ["one", "two", "three", "four", "five", "six"];

export default function ClassworksLoading() {
  const { t } = useTranslation("common");

  return (
    <>
      {rows.map((row) => (
        <li
          key={row}
          className="border-border bg-card flex gap-2 rounded-xl border p-3 shadow-sm md:p-4"
        >
          <output className="contents">
            <span className="sr-only">{t("loading")}</span>
            <div className="bg-muted size-8 animate-pulse rounded-md" />
            <div className="grid gap-2">
              <div className="bg-muted h-[0.875rem] w-36 animate-pulse rounded-md" />
              <div className="bg-muted h-[0.75rem] w-24 animate-pulse rounded-md" />
            </div>
          </output>
        </li>
      ))}
    </>
  );
}
