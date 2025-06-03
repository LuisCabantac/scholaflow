"use client";

import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveRoleRequest,
  rejectRoleRequest,
  removeRoleRequest,
} from "@/lib/user-management-actions";
import noRequest from "@/public/app/no-role-requests.svg";

import { IRoleRequest } from "@/components/RoleRequestDialog";
import RoleRequestsCard from "@/components/RoleRequestsCard";

export type StatusType = "pending" | "rejected";

export default function RoleRequestsSection({
  onGetAllRequests,
}: {
  onGetAllRequests: (
    status: "pending" | "rejected",
  ) => Promise<IRoleRequest[] | null>;
}) {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { data: requests, isPending: requestsIsPending } = useQuery({
    queryKey: [
      "roleRequests",
      searchParams.get("sort") === null
        ? "pending"
        : (searchParams.get("sort") as StatusType),
    ],
    queryFn: () =>
      onGetAllRequests(
        searchParams.get("sort") === null
          ? "pending"
          : (searchParams.get("sort") as StatusType),
      ),
  });

  const { mutate: approveRequest, isPending: approveRequestIsPending } =
    useMutation({
      mutationFn: approveRoleRequest,
      onSuccess: () => {
        toast.success("Role request has been successfully approved!");
        queryClient.invalidateQueries({
          queryKey: [
            "roleRequests",
            searchParams.get("sort") === null
              ? "pending"
              : (searchParams.get("sort") as StatusType),
          ],
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: rejectRequest, isPending: rejectRequestIsPending } =
    useMutation({
      mutationFn: rejectRoleRequest,
      onSuccess: () => {
        toast.success("Role request has been rejected!");
        queryClient.invalidateQueries({
          queryKey: [
            "roleRequests",
            searchParams.get("sort") === null
              ? "pending"
              : (searchParams.get("sort") as StatusType),
          ],
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: removeRequest, isPending: removeRequestIsPending } =
    useMutation({
      mutationFn: removeRoleRequest,
      onSuccess: () => {
        toast.success("Role request has been successfully removed!");
        queryClient.invalidateQueries({
          queryKey: [
            "roleRequests",
            searchParams.get("sort") === null
              ? "pending"
              : (searchParams.get("sort") as StatusType),
          ],
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  return (
    <section className="flex flex-col items-start justify-start">
      <div className="flex items-start rounded-md bg-[#dbe4ff] p-1 font-medium shadow-sm">
        <Link
          href="/role-requests?sort=pending"
          className={`px-3 py-2 transition-all ${searchParams.get("sort") === "pending" || searchParams.get("sort") === null ? "rounded-md bg-[#f3f6ff] shadow-sm" : "text-[#929bb4]"}`}
        >
          Pending
        </Link>
        <Link
          href="/role-requests?sort=rejected"
          className={`px-3 py-2 transition-all ${searchParams.get("sort") === "rejected" ? "rounded-md bg-[#f3f6ff] shadow-sm" : "text-[#929bb4]"}`}
        >
          Rejected
        </Link>
      </div>
      {requestsIsPending ? (
        <ul className="mt-2 w-full">
          {Array(6)
            .fill(undefined)
            .map((_, index) => (
              <li
                key={index}
                className="flex flex-col gap-2 rounded-md bg-[#f3f6ff] p-2"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-[#dbe4ff]"></div>
                  <div className="h-4 w-24 animate-pulse rounded-md bg-[#dbe4ff]"></div>
                </div>
              </li>
            ))}
        </ul>
      ) : (
        <>
          {requests && requests.length ? (
            <ul className="users__list mt-2 w-full rounded-md">
              {requests?.map((request) => (
                <RoleRequestsCard
                  key={request.id}
                  status={
                    searchParams.get("sort") === null
                      ? "pending"
                      : (searchParams.get("sort") as StatusType)
                  }
                  request={request}
                  approveRequest={approveRequest}
                  rejectRequest={rejectRequest}
                  removeRequest={removeRequest}
                  approveRequestIsPending={approveRequestIsPending}
                  rejectRequestIsPending={rejectRequestIsPending}
                  removeRequestIsPending={removeRequestIsPending}
                />
              ))}
            </ul>
          ) : (
            <div className="flex h-[30rem] w-full flex-col items-center justify-center gap-3 md:h-[25rem] md:gap-2">
              <div className="relative w-[15rem] md:w-[20rem]">
                <Image
                  src={noRequest}
                  alt="no role requests"
                  className="object-cover"
                />
              </div>
              <p className="text-base font-medium">
                There are currently no role change requests to review.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
