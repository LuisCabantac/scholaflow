import { ImagePlus } from "lucide-react";
import { useTranslation } from "react-i18next";

const rows = [
  ["one", "justify-self-end", "w-40"],
  ["two", "justify-self-start", "w-60"],
  ["three", "justify-self-start", "w-60"],
  ["four", "justify-self-start", "w-28"],
  ["five", "justify-self-start", "w-32"],
  ["six", "justify-self-end", "w-56"],
  ["seven", "justify-self-end", "w-16"],
  ["eight", "justify-self-end", "w-20"],
  ["nine", "justify-self-start", "w-40"],
  ["ten", "justify-self-start", "w-36"],
];

export default function ChatLoading() {
  const { t } = useTranslation("common");

  return (
    <output className="md:border-border md:bg-card flex w-full flex-col rounded-md md:border md:p-4">
      <span className="sr-only">{t("loading")}</span>
      <div className="relative pb-16">
        <ul className="grid h-[75dvh] items-end gap-2 overflow-auto rounded-md md:h-[65dvh]">
          {rows.map(([key, align, width]) => (
            <li key={key} className={align}>
              <div
                className={`bg-muted h-4 ${width} animate-pulse rounded-md`}
              />
            </li>
          ))}
        </ul>
        <div className="bg-foreground/10 fixed right-3 bottom-3 left-3 z-10 pt-2 md:absolute md:right-0 md:bottom-0 md:left-0 md:w-full md:bg-card md:pt-0">
          <div className="flex items-center gap-2">
            <ImagePlus className="stroke-muted size-6 animate-pulse" />
            <div className="bg-muted h-[2.7rem] w-full animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    </output>
  );
}
