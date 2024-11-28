import Image from "next/image";

import { IRoleRequest } from "@/components/RoleRequestDialog";
import Button from "@/components/Button";
import { UseMutateFunction } from "@tanstack/react-query";

export default function RoleRequestsCard({
  request,
  approveRequest,
  rejectRequest,
  removeRequest,
  approveRequestIsPending,
  rejectRequestIsPending,
  removeRequestIsPending,
}: {
  request: IRoleRequest;
  approveRequest: UseMutateFunction<void, Error, IRoleRequest, unknown>;
  rejectRequest: UseMutateFunction<void, Error, IRoleRequest, unknown>;
  removeRequest: UseMutateFunction<void, Error, IRoleRequest, unknown>;
  approveRequestIsPending: boolean;
  rejectRequestIsPending: boolean;
  removeRequestIsPending: boolean;
}) {
  return (
    <li
      className="flex w-full flex-col items-start justify-between gap-2 bg-[#f3f6ff] p-2 md:flex-row md:items-center"
      key={request.created_at}
    >
      <div className="flex items-center gap-2">
        <div className="relative h-8 w-8">
          <Image
            src={request.avatar}
            alt={`${request.userName}'s image`}
            fill
            className="rounded-full"
          />
        </div>
        <div>
          <p className="font-medium">{request.userName}</p>
          <p className="text-xs">{request.userEmail}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="primary"
          bg="bg-[#37b24d] hover:bg-[#2f9e44]"
          isLoading={
            approveRequestIsPending ||
            rejectRequestIsPending ||
            removeRequestIsPending
          }
          onClick={() => approveRequest(request)}
        >
          Approve
        </Button>
        <Button
          type="primary"
          bg="bg-[#f03e3e] hover:bg-[#c92a2a]"
          isLoading={
            approveRequestIsPending ||
            rejectRequestIsPending ||
            removeRequestIsPending
          }
          onClick={() => rejectRequest(request)}
        >
          Reject
        </Button>
        <Button
          type="secondary"
          isLoading={
            approveRequestIsPending ||
            rejectRequestIsPending ||
            removeRequestIsPending
          }
          onClick={() => removeRequest(request)}
        >
          Remove
        </Button>
      </div>
    </li>
  );
}
