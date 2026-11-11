import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { streamKeys } from "@/queries/stream";
import type { Classroom } from "@/lib/schema";
import type { SessionUser } from "@/types/auth";
import { classroomKeys } from "@/queries/classroom";
import { classworkKeys } from "@/queries/classwork";
import { joinClassFn } from "@/server/functions/classroom";

import { Button } from "@/components/ui/button";

export default function InviteSection({
  classroom,
  user,
}: {
  classroom: Classroom;
  user: SessionUser;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t: tClassroom } = useTranslation("classroom");
  const { t } = useTranslation("classroom", { keyPrefix: "invite" });

  const join = useMutation({
    mutationFn: () => joinClassFn({ data: classroom.id }),
    onSuccess: async (result) => {
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: classroomKeys.all }),
        queryClient.invalidateQueries({ queryKey: classworkKeys.all }),
        queryClient.invalidateQueries({ queryKey: streamKeys.all }),
      ]);
      await navigate({
        to: "/classroom/class/$classId",
        params: { classId: classroom.id },
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const joined = join.isSuccess && join.data.success;

  function handleJoinClass(event: React.FormEvent) {
    event.preventDefault();
    join.mutate();
  }

  return (
    <div className="bg-card z-10 mx-auto grid w-full max-w-md gap-4 rounded-xl border p-4">
      <div className="w-full">
        <h1 className="text-foreground text-lg font-semibold tracking-tight">
          {classroom.name}
        </h1>
        <p className="text-foreground/90 text-sm">
          {classroom.subject && `${classroom.subject} · `}
          {classroom.section}
        </p>
      </div>
      <div className="bg-card text-foreground/70 flex gap-2 rounded-xl border p-3">
        <img
          src={user.image ?? ""}
          alt={tClassroom("card.avatarAlt", { name: user.name })}
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-full select-none"
          onDragStart={(e) => e.preventDefault()}
        />
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-xs">{user.email}</p>
        </div>
      </div>
      <form className="grid gap-3" onSubmit={handleJoinClass}>
        {joined && (
          <div className="bg-card text-muted-foreground flex gap-2 rounded-xl border p-3">
            <CircleCheck className="stroke-success h-6 w-6 shrink-0" />
            <span>{t("joined")}</span>
          </div>
        )}
        <Button
          disabled={join.isPending || joined}
          type="submit"
          className="w-full"
        >
          {join.isPending ? t("joining") : t("join")}
        </Button>
      </form>
    </div>
  );
}
