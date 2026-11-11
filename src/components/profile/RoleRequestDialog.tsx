import { toast } from "sonner";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import type { RoleRequest } from "@/lib/schema";
import type { SessionUser } from "@/types/auth";
import { useClickOutside } from "@/hooks/use-click-outside";
import { userManagementKeys } from "@/queries/user-management";
import { requestTeacherRoleFn } from "@/server/functions/user-management";

import { Button } from "@/components/ui/button";

export default function RoleRequestDialog({
  user,
  existingRequest,
  onClose,
}: {
  user: SessionUser;
  existingRequest: RoleRequest | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["profile", "common"]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmitRoleRequest(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const { success, message } = await requestTeacherRoleFn({ data: formData });
    setIsLoading(false);

    if (!success) {
      toast.error(message);
      return;
    }

    toast.success(message);
    await queryClient.invalidateQueries({ queryKey: userManagementKeys.all });
    onClose();
  }

  useClickOutside(wrapperRef, onClose, isLoading);

  return (
    <div className="modal__container">
      <div className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[30%]">
        <div
          className="bg-card relative grid w-full gap-4 rounded-md p-4"
          ref={wrapperRef}
        >
          <div>
            <h4 className="text-lg font-semibold tracking-tight">
              {t("role.dialogTitle")}
            </h4>
            <p>{existingRequest ? t("role.pending") : t("role.description")}</p>
          </div>
          {!existingRequest && (
            <form className="grid gap-4" onSubmit={handleSubmitRoleRequest}>
              <input type="text" name="userId" defaultValue={user.id} hidden />
              <div className="flex items-center justify-end gap-2">
                {!isLoading && (
                  <Button type="button" variant="secondary" onClick={onClose}>
                    {t("common:actions.cancel")}
                  </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                  {t("actions.request")}
                </Button>
              </div>
            </form>
          )}
          <button
            type="button"
            className="absolute top-4 right-4 disabled:cursor-not-allowed"
            aria-label={t("actions.close")}
            disabled={isLoading}
            onClick={onClose}
          >
            <X className="size-5 transition-all hover:stroke-[#656b70]" />
          </button>
        </div>
      </div>
    </div>
  );
}
