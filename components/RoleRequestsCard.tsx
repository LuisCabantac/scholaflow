import Image from "next/image";
import { UseMutateFunction } from "@tanstack/react-query";

import SpinnerMini from "@/components/SpinnerMini";
import { StatusType } from "@/components/RoleRequestsSection";
import { RoleRequest } from "@/lib/schema";

export default function RoleRequestsCard({
  status,
  request,
  approveRequest,
  rejectRequest,
  removeRequest,
  approveRequestIsPending,
  rejectRequestIsPending,
  removeRequestIsPending,
}: {
  status: StatusType;
  request: RoleRequest;
  approveRequest: UseMutateFunction<void, Error, RoleRequest, unknown>;
  rejectRequest: UseMutateFunction<void, Error, RoleRequest, unknown>;
  removeRequest: UseMutateFunction<void, Error, RoleRequest, unknown>;
  approveRequestIsPending: boolean;
  rejectRequestIsPending: boolean;
  removeRequestIsPending: boolean;
}) {
  return (
    <li
      className="flex w-full flex-col items-start justify-between gap-2 bg-[#f3f6ff] p-2 md:flex-row md:items-center"
      key={request.id}
    >
      <div className="flex items-center gap-2">
        <Image
          src={request.userImage}
          alt={`${request.userName}'s image`}
          width={32}
          height={32}
          className="h-8 w-8 flex-shrink-0 rounded-full"
        />
        <div>
          <p className="font-medium">{request.userName}</p>
          <p className="text-xs">{request.userEmail}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-10 items-center gap-1 rounded-md bg-[#37b24d] px-4 py-2 font-medium text-[#edf2ff] shadow-sm transition-colors hover:bg-[#2f9e44] disabled:cursor-not-allowed disabled:bg-[#2b8a3e] md:gap-2"
          disabled={
            approveRequestIsPending ||
            rejectRequestIsPending ||
            removeRequestIsPending
          }
          onClick={() => approveRequest(request)}
        >
          {approveRequestIsPending && <SpinnerMini />}Approve
        </button>
        {status === "pending" && (
          <button
            type="button"
            className="flex h-10 items-center gap-1 rounded-md bg-[#f03e3e] px-4 py-2 font-medium text-[#edf2ff] shadow-sm transition-colors hover:bg-[#e03131] disabled:cursor-not-allowed disabled:bg-[#c92a2a] md:gap-2"
            disabled={
              approveRequestIsPending ||
              rejectRequestIsPending ||
              removeRequestIsPending
            }
            onClick={() => rejectRequest(request)}
          >
            {rejectRequestIsPending && <SpinnerMini />}Reject
          </button>
        )}
        <button
          type="button"
          className="flex h-10 items-center gap-1 rounded-md bg-[#e1e7f5] px-4 py-2 font-medium text-[#22317c] shadow-sm transition-colors hover:bg-[#d9dfee] disabled:cursor-not-allowed disabled:bg-[#c5cde6] md:gap-2"
          disabled={
            approveRequestIsPending ||
            rejectRequestIsPending ||
            removeRequestIsPending
          }
          onClick={() => removeRequest(request)}
        >
          {removeRequestIsPending && <SpinnerMini />}Remove
        </button>
      </div>
    </li>
  );
}
