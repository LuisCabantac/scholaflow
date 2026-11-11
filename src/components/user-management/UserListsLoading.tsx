import { useTranslation } from "react-i18next";

const rows = ["one", "two", "three", "four"];

export default function UserListsLoading() {
  const { t } = useTranslation("common");

  return (
    <>
      {rows.map((row) => (
        <tr key={row} className="bg-card">
          <td className="flex items-center gap-2 px-4 py-2">
            <output className="contents">
              <span className="sr-only">{t("loading")}</span>
              <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
              <div className="bg-muted h-5 w-28 animate-pulse rounded-md" />
            </output>
          </td>
          <td className="px-4 py-2">
            <div className="bg-muted h-4 w-36 animate-pulse rounded-md" />
          </td>
          <td className="px-4 py-2">
            <div className="bg-muted h-8 w-24 animate-pulse rounded-md" />
          </td>
          <td className="px-4 py-2">
            <div className="bg-muted h-5 w-24 animate-pulse rounded-md" />
          </td>
          <td className="px-4 py-2">
            <div className="bg-muted h-5 w-5 animate-pulse rounded-md" />
          </td>
          <td className="relative px-4 py-2">
            <div className="absolute -top-[12rem] right-2 md:top-4 md:right-4">
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                className="stroke-muted size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                />
              </svg>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
