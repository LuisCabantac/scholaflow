import { Pen, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

const cards = [
  { id: "one", title: "w-28", lines: ["a:w-full", "b:w-20"] },
  {
    id: "two",
    title: "w-24",
    lines: ["a:w-full", "b:w-full", "c:w-full", "d:w-full"],
  },
  {
    id: "three",
    title: "w-20",
    lines: ["a:w-full", "b:w-full", "c:w-full", "d:w-20"],
  },
  { id: "four", title: "w-20", lines: ["a:w-full", "b:w-full", "c:w-full"] },
];

export default function NotesLoading({
  listOnly = false,
}: {
  listOnly?: boolean;
}) {
  const { t } = useTranslation(["notes", "common"]);

  return (
    <div>
      {!listOnly && (
        <div className="flex items-center justify-between">
          <div className="group bg-muted flex h-10 w-[60%] animate-pulse items-center gap-2 rounded-full border text-sm md:w-[50%]">
            <Search className="stroke-muted-foreground mb-0.5 ml-3 h-4 w-4" />
            <div className="mb-0.5 flex-1 py-2">
              <div className="bg-muted-foreground/20 h-4 w-20 rounded" />
            </div>
          </div>
          <div className="bg-primary text-primary-foreground flex h-9 cursor-not-allowed items-center justify-center gap-2 rounded-full px-4 font-medium shadow-sm">
            <Pen className="h-4 w-4" />
            {t("notes:newNote")}
          </div>
        </div>
      )}
      <ul className="mt-2 columns-2 gap-2 md:columns-4">
        <li className="sr-only">{t("common:loading")}</li>
        {cards.map((card) => (
          <li
            key={card.id}
            className="bg-card mb-2 w-full break-inside-avoid rounded-xl border p-3 break-all md:p-4"
          >
            <div className="grid gap-2">
              <div
                className={`bg-muted h-4 animate-pulse rounded-md ${card.title}`}
              />
              <div>
                {card.lines.map((line) => (
                  <div
                    key={line}
                    className={`bg-muted mt-1 h-[0.875rem] animate-pulse rounded-md ${line.split(":")[1]}`}
                  />
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
