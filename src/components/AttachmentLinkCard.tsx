export default function AttachmentLinkCard({
  link,
  index,
  location,
  isLoading,
  onRemoveAttachment,
}: {
  link: string;
  index: number;
  location: "form" | "stream";
  isLoading?: boolean;
  attachmentAmount?: number;
  onRemoveAttachment?: (index: number) => void;
}) {
  return (
    <li className="relative flex w-full items-center overflow-hidden rounded-xl border bg-foreground/5 shadow-sm">
      <a
        href={link.includes("https://") ? link : `https://${link}`}
        target="_blank"
        className={`flex items-center justify-between p-3 ${!isLoading && location === "form" && onRemoveAttachment ? "w-[88%]" : "w-[90%]"}`}
      >
        <div className="flex w-full items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            className="size-4 flex-shrink-0 stroke-foreground md:size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
            />
          </svg>
          <p className="overflow-hidden text-ellipsis whitespace-nowrap">
            {link}
          </p>
        </div>
      </a>
      <div className="absolute -right-1 bottom-[0.85rem] flex items-center gap-4">
        <a
          href={link.includes("https://") ? link : `https://${link}`}
          target="_blank"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            className="size-4 flex-shrink-0 stroke-primary hover:stroke-primary/90 md:size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
        </a>
        {!isLoading && location === "form" && onRemoveAttachment ? (
          <button
            onClick={() => onRemoveAttachment(index)}
            type="button"
            className="pr-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-4 flex-shrink-0 stroke-destructive hover:stroke-destructive/90 md:size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        ) : (
          <div className="w-2 md:w-[0.35rem]"></div>
        )}
      </div>
    </li>
  );
}
