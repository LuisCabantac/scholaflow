import { useTranslation } from "react-i18next";

import type { Classroom } from "@/lib/schema";
import { classIllustration } from "@/lib/class-illustrations";

export default function ClassHeaderCard({
  classroom,
  isTeacher,
  studentCount,
  onOpenSettings,
}: {
  classroom: Classroom;
  isTeacher: boolean;
  studentCount: number;
  onOpenSettings: () => void;
}) {
  const { t } = useTranslation("stream", { keyPrefix: "header" });

  return (
    <div
      className="relative h-[9rem] rounded-xl shadow-sm md:h-[10rem]"
      style={{ backgroundColor: classroom.cardBackground }}
    >
      <div className="absolute top-3 left-3 w-[80%] text-balance drop-shadow-sm md:top-4 md:left-4">
        <h5 className="overflow-hidden text-lg font-semibold text-[#eeeeee] text-ellipsis whitespace-nowrap md:text-2xl">
          {classroom.name}
        </h5>
        <p className="overflow-hidden text-base font-medium text-[#eeeeee] text-ellipsis whitespace-nowrap">
          {classroom.subject && `${classroom.subject} · `}
          {classroom.section}
        </p>
      </div>
      <div className="absolute bottom-3 left-3 flex w-[88%] items-center gap-2 text-balance drop-shadow-sm md:bottom-4 md:left-4">
        <div className="flex items-center gap-2">
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-4 stroke-[#F5F5F5] md:size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
            />
          </svg>
          <p className="overflow-hidden text-[#F5F5F5] text-ellipsis whitespace-nowrap">
            {classroom.teacherName}
          </p>
        </div>
        {studentCount > 0 && (
          <>
            <p className="overflow-hidden text-[#F5F5F5] text-ellipsis whitespace-nowrap">
              ·
            </p>
            <div className="flex items-center gap-2">
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-4 stroke-[#F5F5F5] md:size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                />
              </svg>
              <p className="overflow-hidden text-[#F5F5F5] text-ellipsis whitespace-nowrap">
                {studentCount} {studentCount > 1 ? t("students") : t("student")}
              </p>
            </div>
          </>
        )}
      </div>
      <div className="absolute right-4 bottom-5">
        <svg
          aria-hidden="true"
          viewBox="0 0 64 64"
          className="w-24 -rotate-45 mix-blend-overlay md:w-28"
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeMiterlimit={10}
            strokeWidth={2}
            d={classIllustration(classroom.illustrationIndex)}
          />
        </svg>
      </div>
      {isTeacher && (
        <button
          className="absolute top-3 right-3"
          type="button"
          aria-label={t("settings")}
          onClick={onOpenSettings}
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-5 stroke-[#F5F5F5] md:size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
