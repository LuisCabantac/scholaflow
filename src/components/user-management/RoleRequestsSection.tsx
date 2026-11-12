import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { userKeys } from "@/queries/user";
import type { RoleRequest } from "@/lib/schema";
import type { RoleRequestStatus } from "@/types/user-management";
import { groupRoleRequests, roleRequestStatus } from "@/lib/role-requests";
import {
  userManagementKeys,
  userManagementQueries,
} from "@/queries/user-management";
import {
  approveRoleRequestFn,
  rejectRoleRequestFn,
  removeRoleRequestFn,
} from "@/server/functions/user-management";

import RoleRequestsCard from "@/components/user-management/RoleRequestsCard";

type RequestAction = (data: {
  data: { userId: string; requestId: string };
}) => Promise<{ success: boolean; message: string }>;

function useRoleRequestMutation({
  action,
  patch,
  successMessage,
  invalidateUsers = false,
}: {
  action: RequestAction;
  patch: (current: RoleRequest[], request: RoleRequest) => RoleRequest[];
  successMessage: string;
  invalidateUsers?: boolean;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: RoleRequest) => {
      const result = await action({
        data: { userId: request.userId, requestId: request.id },
      });
      if (!result.success) throw new Error(result.message);
    },
    onMutate: async (request) => {
      const key = userManagementKeys.roleRequests();
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (current: RoleRequest[] | undefined) =>
        patch(current ?? [], request),
      );
      return { key, previous };
    },
    onError: (error, _request, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous);
      toast.error(error.message);
    },
    onSuccess: () => toast.success(successMessage),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.all });
      if (invalidateUsers) {
        queryClient.invalidateQueries({ queryKey: userKeys.all });
      }
    },
  });
}

const without = (current: RoleRequest[], request: RoleRequest) =>
  current.filter((item) => item.id !== request.id);

export default function RoleRequestsSection({
  sort,
}: {
  sort: RoleRequestStatus | undefined;
}) {
  const { t } = useTranslation("userManagement", {
    keyPrefix: "roleRequests",
  });

  const status = roleRequestStatus(sort);
  const { data: allRequests } = useSuspenseQuery(
    userManagementQueries.roleRequests(),
  );
  const requests = groupRoleRequests(allRequests)[status];

  const approve = useRoleRequestMutation({
    action: approveRoleRequestFn,
    patch: without,
    successMessage: t("approved"),
    invalidateUsers: true,
  });
  const reject = useRoleRequestMutation({
    action: rejectRoleRequestFn,
    patch: (current, request) =>
      current.map((item) =>
        item.id === request.id ? { ...item, status: "rejected" } : item,
      ),
    successMessage: t("rejectedToast"),
  });
  const remove = useRoleRequestMutation({
    action: removeRoleRequestFn,
    patch: without,
    successMessage: t("removed"),
  });

  const tabClass = (tab: RoleRequestStatus) =>
    `px-3 py-2 transition-all ${status === tab ? "bg-card rounded-md shadow-sm" : "text-muted-foreground"}`;

  return (
    <section className="flex flex-col items-start justify-start gap-2">
      <h2 className="text-foreground text-lg font-semibold tracking-tight">
        {t("title")}
      </h2>
      <div className="bg-muted flex items-start rounded-md p-1 font-medium shadow-sm">
        <Link
          to="/user-management"
          search={{ sort: "pending" }}
          className={tabClass("pending")}
        >
          {t("pending")}
        </Link>
        <Link
          to="/user-management"
          search={{ sort: "rejected" }}
          className={tabClass("rejected")}
        >
          {t("rejected")}
        </Link>
      </div>
      {requests.length ? (
        <ul className="users__list w-full rounded-md">
          {requests.map((request) => (
            <RoleRequestsCard
              key={request.id}
              status={status}
              request={request}
              onApprove={() => approve.mutate(request)}
              onReject={() => reject.mutate(request)}
              onRemove={() => remove.mutate(request)}
              approveIsPending={approve.isPending}
              rejectIsPending={reject.isPending}
              removeIsPending={remove.isPending}
            />
          ))}
        </ul>
      ) : (
        <div className="flex h-[30rem] w-full flex-col items-center justify-center gap-3 md:h-[25rem] md:gap-2">
          <div className="relative w-[15rem] md:w-[20rem]">
            <img
              src="/app/no-role-requests.svg"
              alt={t("imageAlt")}
              className="object-cover"
            />
          </div>
          <p className="text-base font-medium">{t("empty")}</p>
        </div>
      )}
    </section>
  );
}
