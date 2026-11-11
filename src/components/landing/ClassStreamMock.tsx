import { useTranslation } from "react-i18next";

import MockAvatar from "@/components/landing/MockAvatar";

const itemKeys = [
  "theorems",
  "surface",
  "planes",
  "modeling",
  "numerical",
] as const;

export default function ClassStreamMock() {
  const { t } = useTranslation("landing", { keyPrefix: "mocks" });

  return (
    <>
      <div className="relative h-24 w-full overflow-hidden rounded-xl bg-[#a7adcb] px-2 py-2 text-[#F5F5F5] shadow-sm">
        <p className="w-[70%] overflow-hidden text-base font-semibold text-ellipsis whitespace-nowrap md:w-full">
          {t("classroom.name")}
        </p>
        <p className="font-medium">{t("classroom.section")}</p>
        <div className="absolute right-4 bottom-5 md:right-3 md:bottom-2">
          <svg
            aria-hidden="true"
            viewBox="0 0 64 64"
            className="w-14 -rotate-45 mix-blend-overlay"
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeMiterlimit={10}
              strokeWidth={2}
              d="M1 1h46v62H1zM9 63V2M14 15h28M14 21h28M63 3v50l-4 8-4-8V3zM55 7h-4v10"
            />
          </svg>
        </div>
      </div>
      <div className="text-foreground mt-2 flex items-center gap-2 rounded-xl border px-2 py-2 text-xs shadow-sm">
        <MockAvatar file="comment-5-avatar.jpg" name={t("people.lori")} />
        <p className="text-foreground/70">{t("classroom.share")}</p>
      </div>
      {itemKeys.map((key) => (
        <div
          key={key}
          className="mt-2 flex items-center gap-2 rounded-xl border px-2 py-2 text-xs font-medium shadow-sm"
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="stroke-primary size-4 shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
            />
          </svg>
          <p className="text-foreground/70">{t(`classroom.items.${key}`)}</p>
        </div>
      ))}
    </>
  );
}
