import { toast } from "sonner";
import { useRef } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useDismiss } from "@/hooks/use-dismiss";
import { classroomKeys } from "@/queries/classroom";
import { useClickOutside } from "@/hooks/use-click-outside";
import { addUserToClassFn } from "@/server/functions/classroom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AddUserToClassDialog({
  classId,
  onClose,
}: {
  classId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("people", { keyPrefix: "dialog" });

  const wrapperRef = useRef<HTMLDivElement>(null);

  const addUser = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await addUserToClassFn({ data: formData });
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({
        queryKey: classroomKeys.enrolledByClass(classId),
      });
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addUser.mutate(new FormData(event.currentTarget));
  }

  const { phase, close } = useDismiss(onClose, addUser.isPending);
  useClickOutside(wrapperRef, close, addUser.isPending);

  return (
    <div className="modal__container" data-phase={phase}>
      <div className="animate-in fade-in-0 zoom-in-95 duration-200 ease-out flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[30%]">
        <Card className="md:w-[25rem]" ref={wrapperRef}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-lg font-semibold tracking-tight">
                {t("title")}
              </h3>
              <Button
                className="hover:bg-transparent"
                variant="ghost"
                type="button"
                size="icon"
                disabled={addUser.isPending}
                onClick={close}
                aria-label={t("close")}
              >
                <X className="stroke-foreground size-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <input
                type="text"
                name="classroomId"
                value={classId}
                readOnly
                hidden
              />
              <Input
                id="addUserEmail"
                disabled={addUser.isPending}
                required
                type="email"
                name="email"
                aria-label={t("emailPlaceholder")}
                placeholder={t("emailPlaceholder")}
              />
              <div className="flex items-center justify-end gap-2">
                {!addUser.isPending && (
                  <Button type="button" variant="secondary" onClick={close}>
                    {t("cancel")}
                  </Button>
                )}
                <Button type="submit" disabled={addUser.isPending}>
                  {t("add")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
