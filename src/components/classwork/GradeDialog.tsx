import { toast } from "sonner";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import { classworkKeys } from "@/queries/classwork";
import { useClickOutside } from "@/hooks/use-click-outside";
import type { Classroom, Classwork, Stream } from "@/lib/schema";
import { addGradeClassworkFn } from "@/server/functions/classwork";

import { Button } from "@/components/ui/button";

export default function GradeDialog({
  stream,
  classroom,
  userId,
  classwork,
  onClose,
}: {
  stream: Stream;
  classroom: Classroom;
  userId: string;
  classwork: Classwork | null | undefined;
  onClose: () => void;
}) {
  const { t } = useTranslation("classwork", { keyPrefix: "submissions" });
  const queryClient = useQueryClient();

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [grade, setGrade] = useState(
    classwork?.points === null || classwork?.points === undefined
      ? ""
      : String(classwork.points),
  );

  useClickOutside(wrapperRef, onClose, isLoading);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);

    try {
      const { success, message } = await addGradeClassworkFn({
        data: formData,
      });
      if (!success) {
        toast.error(message);
        return;
      }
      toast.success(message);
      await queryClient.invalidateQueries({ queryKey: classworkKeys.all });
      onClose();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="modal__container">
      <div className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[30%]">
        <div
          className="bg-card relative grid gap-4 rounded-xl p-4"
          ref={wrapperRef}
        >
          <div>
            <h4 className="text-lg font-semibold tracking-tight">
              {t("addGrade")}
            </h4>
            <p>{t("addGradeDescription")}</p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <input
              type="text"
              name="classworkId"
              value={classwork?.id ?? ""}
              readOnly
              hidden
            />
            <input
              type="text"
              name="classroomId"
              value={classroom.id}
              readOnly
              hidden
            />
            <input
              type="text"
              name="streamId"
              value={stream.id}
              readOnly
              hidden
            />
            <input type="text" name="userId" value={userId} readOnly hidden />
            <input
              type="number"
              name="userPoints"
              required
              aria-label={t("grade")}
              className="focus:border-primary disabled:text-foreground rounded-md border bg-transparent px-4 py-2 focus:outline-none"
              disabled={isLoading}
              value={grade}
              onChange={(event) => {
                if (/^\d*$/.test(event.target.value))
                  setGrade(event.target.value);
              }}
            />
            <div className="flex items-center justify-end">
              <Button type="submit" disabled={isLoading}>
                {t("done")}
              </Button>
            </div>
          </form>
          <button
            type="button"
            className="absolute top-4 right-4 disabled:cursor-not-allowed"
            disabled={isLoading}
            aria-label={t("close")}
            onClick={onClose}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-5 transition-all hover:stroke-[#656b70]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
