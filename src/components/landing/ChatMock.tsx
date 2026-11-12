import { useTranslation } from "react-i18next";

import MockAvatar from "@/components/landing/MockAvatar";

function Bubble({
  name,
  file,
  text,
  className = "ml-3 mt-3",
}: {
  name: string;
  file: string;
  text: string;
  className?: string;
}) {
  return (
    <div className={`${className} grid gap-0.5`}>
      <div className="flex">
        <div className="h-1 w-7" />
        <p className="mb-0.5 text-xs font-medium">{name}</p>
      </div>
      <div className="flex gap-1">
        <MockAvatar file={file} name={name} />
        <p className="rounded-xl border px-2 py-1 text-xs">{text}</p>
      </div>
    </div>
  );
}

export default function ChatMock() {
  const { t } = useTranslation("landing", { keyPrefix: "mocks" });

  return (
    <>
      <Bubble
        name={t("people.gerald")}
        file="comment-4-avatar.webp"
        text={t("chat.transform")}
      />
      <div className="mt-3 ml-3 grid gap-0.5">
        <div className="flex">
          <div className="h-1 w-7" />
          <p className="mb-0.5 text-xs font-medium">{t("people.lori")}</p>
        </div>
        <div className="flex gap-1">
          <MockAvatar file="comment-3-avatar.webp" name={t("people.lori")} />
          <p className="rounded-xl border px-2 py-1 text-xs">
            {t("chat.exactly")}
          </p>
        </div>
        <div className="mt-0.5 flex">
          <div className="h-1 w-7" />
          <img
            src="/landing_page/chat-1-image.webp"
            alt={t("chat.imageAlt")}
            width={480}
            height={282}
            loading="lazy"
            decoding="async"
            className="w-[12rem] rounded-xl object-cover"
          />
        </div>
        <div className="mt-0.5 flex overflow-hidden">
          <div className="h-1 w-7" />
          <div className="flex w-full items-center justify-between rounded-xl border px-2 py-2">
            <div className="flex w-full items-center gap-2 overflow-hidden">
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="hidden size-4 md:block"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                />
              </svg>
              <p className="overflow-hidden text-xs text-ellipsis whitespace-nowrap">
                {t("chat.file")}
              </p>
            </div>
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              className="stroke-primary hover:stroke-primary/90 hidden size-4 shrink-0 md:block"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </div>
        </div>
        <Bubble
          name={t("people.gerald")}
          file="comment-4-avatar.webp"
          text={t("chat.stepByStep")}
          className="mt-3"
        />
        <Bubble
          name={t("people.zachariah")}
          file="comment-2-avatar.webp"
          text={t("chat.excited")}
        />
      </div>
    </>
  );
}
