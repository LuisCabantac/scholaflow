"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

import { ISession } from "@/lib/auth";

import { IUser } from "@/components/UserManagementSection";
import EditProfileForm from "@/components/EditProfileForm";
import RoleRequestDialog, {
  IRoleRequest,
} from "@/components/RoleRequestDialog";

export default function ProfileSection({
  session,
  onGetUser,
  onCloseProfile,
  existingRequest,
}: {
  session: ISession;
  onGetUser: (email: string) => Promise<IUser | null>;
  onCloseProfile: (userId: string) => Promise<void>;
  existingRequest: IRoleRequest | null;
}) {
  const [showEditProfileForm, setShowEditProfileForm] = useState(false);
  const [showRoleRequest, setShowRoleRequest] = useState(false);

  const { data: user, isPending: userIsPending } = useQuery({
    queryKey: [`profile--${session.user.id}`],
    queryFn: () => onGetUser(session.user.email),
  });

  function handleToggleShowEditProfileForm() {
    setShowEditProfileForm(!showEditProfileForm);
  }

  function handleToggleShowRoleRequest() {
    setShowRoleRequest(!showRoleRequest);
  }

  return (
    <section>
      <div className="grid gap-4 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {userIsPending ? (
              <div
                className="h-12 w-12 animate-pulse rounded-full bg-[#dbe4ff]"
                role="status"
              >
                <span className="sr-only">Loading…</span>
              </div>
            ) : (
              <Image
                src={user?.avatar ?? ""}
                alt={`${user?.fullName}'s photo`}
                width={48}
                height={48}
                className="h-12 w-12 flex-shrink-0 rounded-full"
              />
            )}
            <div className="flex flex-col items-start justify-start">
              {userIsPending ? (
                <div
                  className="h-[1.125rem] w-40 animate-pulse rounded-md bg-[#dbe4ff]"
                  role="status"
                >
                  <span className="sr-only">Loading…</span>
                </div>
              ) : (
                <h2 className="text-lg font-semibold">{user?.fullName}</h2>
              )}
              {!userIsPending && (
                <button
                  type="button"
                  onClick={handleToggleShowEditProfileForm}
                  className="font-medium text-[#22317c] hover:text-[#384689] disabled:text-[#1b2763]"
                >
                  Edit profile
                </button>
              )}
            </div>
          </div>
          {userIsPending ? (
            <div
              className="h-6 w-12 animate-pulse rounded-md bg-[#dbe4ff]"
              role="status"
            >
              <span className="sr-only">Loading…</span>
            </div>
          ) : (
            <p
              className={`role flex items-center justify-center rounded-md px-3 py-1.5 text-[0.7rem] font-semibold uppercase ${user?.role === "admin" ? "admin" : user?.role === "student" ? "student" : user?.role === "teacher" ? "teacher" : "guest"}`}
            >
              {user?.role}
            </p>
          )}
        </div>
        <div className="flex flex-col items-start justify-start gap-2 md:flex-row md:items-center md:justify-between">
          <div className="grid gap-2 md:flex md:items-center">
            <div>
              {userIsPending ? (
                <div
                  className="mb-1 h-[0.875rem] w-48 animate-pulse rounded-md bg-[#dbe4ff]"
                  role="status"
                >
                  <span className="sr-only">Loading…</span>
                </div>
              ) : (
                <p className="font-medium">{user?.email}</p>
              )}
              <h4 className="text-xs font-medium text-[#616572]">Email</h4>
            </div>
            <div className="mx-4 hidden h-8 w-px bg-[#dbe4ff] md:block"></div>
            <div>
              {userIsPending ? (
                <div
                  className="mb-1 h-[0.875rem] w-20 animate-pulse rounded-md bg-[#dbe4ff]"
                  role="status"
                >
                  <span className="sr-only">Loading…</span>
                </div>
              ) : (
                <p className="font-medium">
                  {user?.schoolName ? user?.schoolName : "N/A"}
                </p>
              )}
              <h4 className="text-xs font-medium text-[#616572]">School</h4>
            </div>
            <div className="mx-4 hidden h-8 w-px bg-[#dbe4ff] md:block"></div>
            <div>
              {userIsPending ? (
                <div
                  className="mb-1 h-[0.875rem] w-24 animate-pulse rounded-md bg-[#dbe4ff]"
                  role="status"
                >
                  <span className="sr-only">Loading…</span>
                </div>
              ) : (
                <p className="font-medium">
                  {format(user?.created_at ?? "", "MMMM dd, yyyy")}
                </p>
              )}
              <h4 className="text-xs font-medium text-[#616572]">Joined</h4>
            </div>
          </div>
          {!userIsPending && session.user.role !== "teacher" && (
            <button
              type="button"
              onClick={handleToggleShowRoleRequest}
              className="font-medium text-[#22317c] hover:text-[#384689] disabled:text-[#1b2763]"
            >
              Switch to teacher role
            </button>
          )}
        </div>
      </div>
      {showEditProfileForm && (
        <EditProfileForm
          user={user}
          session={session}
          onCloseProfile={onCloseProfile}
          handleSetShowEditProfileForm={setShowEditProfileForm}
          onToggleShowEditProfileForm={handleToggleShowEditProfileForm}
        />
      )}
      {showRoleRequest && (
        <RoleRequestDialog
          session={session}
          existingRequest={existingRequest}
          onToggleShowRoleRequest={handleToggleShowRoleRequest}
          handleSetShowRoleRequest={setShowRoleRequest}
        />
      )}
    </section>
  );
}
