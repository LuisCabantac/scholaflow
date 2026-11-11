import { useTranslation } from "react-i18next";

import type { RoleRequest } from "@/lib/schema";
import type { RoleRequestStatus } from "@/types/user-management";

import { Button } from "@/components/ui/button";
import SpinnerMini from "@/components/shared/SpinnerMini";

export default function RoleRequestsCard({
  status,
  request,
  onApprove,
  onReject,
  onRemove,
  approveIsPending,
  rejectIsPending,
  removeIsPending,
}: {
  status: RoleRequestStatus;
  request: RoleRequest;
  onApprove: () => void;
  onReject: () => void;
  onRemove: () => void;
  approveIsPending: boolean;
  rejectIsPending: boolean;
  removeIsPending: boolean;
}) {
  const { t } = useTranslation("userManagement", {
    keyPrefix: "roleRequests",
  });

  const isBusy = approveIsPending || rejectIsPending || removeIsPending;

  return (
    <li className="bg-card flex w-full flex-col items-start justify-between gap-2 p-2 md:flex-row md:items-center">
      <div className="flex items-center gap-2">
        <img
          src={request.userImage}
          alt={t("avatarAlt", { name: request.userName })}
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-full"
        />
        <div>
          <p className="font-medium">{request.userName}</p>
          <p className="text-xs">{request.userEmail}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" disabled={isBusy} onClick={onApprove}>
          {approveIsPending && <SpinnerMini />}
          {t("approve")}
        </Button>
        {status === "pending" && (
          <Button
            type="button"
            variant="destructive"
            disabled={isBusy}
            onClick={onReject}
          >
            {rejectIsPending && <SpinnerMini />}
            {t("reject")}
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          disabled={isBusy}
          onClick={onRemove}
        >
          {removeIsPending && <SpinnerMini />}
          {t("remove")}
        </Button>
      </div>
    </li>
  );
}
