import { useTranslation } from "react-i18next";

const rows = ["one", "two", "three", "four", "five", "six"];

export default function PeopleLoading() {
  const { t } = useTranslation(["people", "common"]);

  return (
    <output className="grid gap-2">
      <span className="sr-only">{t("common:loading")}</span>
      <div className="flex items-center justify-between">
        <p className="text-base font-medium">{t("people:allUsers")}</p>
      </div>
      <ul className="rounded-xl">
        {rows.map((row) => (
          <li key={row} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
              <div className="bg-muted h-4 w-24 animate-pulse rounded-md" />
            </div>
          </li>
        ))}
      </ul>
    </output>
  );
}
