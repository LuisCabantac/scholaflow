import { toast } from "sonner";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ClientOnly } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { userQueries } from "@/queries/user";
import { joinedDate } from "@/lib/profile-form";
import type { AuthResult, SessionUser } from "@/types/auth";
import { requestAccountClosureFn } from "@/server/functions/auth";
import { userManagementQueries } from "@/queries/user-management";

import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/shared/UserAvatar";
import ProfileForm from "@/components/profile/ProfileForm";
import ConfirmationModal from "@/components/shared/ConfirmationModal";
import RoleRequestDialog from "@/components/profile/RoleRequestDialog";

export default function ProfileSection({ user }: { user: SessionUser }) {
  const { t } = useTranslation(["profile", "auth"]);

  const { data: profile } = useSuspenseQuery(userQueries.byId(user.id));
  const { data: existingRequest } = useSuspenseQuery(
    userManagementQueries.roleRequestByUser(user.id),
  );

  const name = profile?.name ?? user.name;
  const email = profile?.email ?? user.email;
  const image = profile?.image ?? user.image ?? "";
  const createdAt = profile?.createdAt ?? user.createdAt;
  const schoolName = profile?.schoolName ?? user.schoolName;

  const [isLoading, setIsLoading] = useState(false);
  const [showRoleRequest, setShowRoleRequest] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showEditProfileForm, setShowEditProfileForm] = useState(false);

  async function handleRequestClosure() {
    setIsLoading(true);
    const result = await requestAccountClosureFn({ data: user.email }).catch(
      (): AuthResult => ({ success: false, code: "emailSendFailed" }),
    );
    setIsLoading(false);

    if (!result.success) {
      toast.error(t(`auth:results.${result.code}`));
      return;
    }

    setShowConfirmation(false);
    toast.success(t(`auth:results.${result.code}`));
  }

  return (
    <section className="grid gap-4">
      <div className="mx-auto">
        <div className="flex flex-col items-center gap-y-4">
          <UserAvatar
            src={image}
            alt={t("avatarAlt", { name })}
            width={48}
            height={48}
            className="h-16 w-16 shrink-0 rounded-full object-cover md:h-24 md:w-24"
          />
          <h3 className="text-foreground text-xl font-semibold tracking-tight">
            {name}
          </h3>
          <Button type="button" onClick={() => setShowEditProfileForm(true)}>
            {t("actions.editProfile")}
          </Button>
        </div>
      </div>
      <div>
        <h3 className="text-foreground pb-2 text-lg font-medium tracking-tight">
          {t("info.title")}
        </h3>
        <div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-card flex flex-col rounded-xl border p-4 shadow-sm transition-all hover:shadow-md">
              <h4 className="text-foreground/70 text-xs font-semibold">
                {t("info.email")}
              </h4>
              <p className="text-foreground mt-1 font-medium [overflow-wrap:anywhere]">
                {email}
              </p>
            </div>
            <div className="bg-card flex flex-col rounded-xl border p-4 shadow-sm transition-all hover:shadow-md">
              <h4 className="text-foreground/70 text-xs font-semibold">
                {t("info.school")}
              </h4>
              <p className="text-foreground mt-1 font-medium">
                {schoolName ? schoolName : t("info.notAvailable")}
              </p>
            </div>
            <div className="bg-card flex flex-col rounded-xl border p-4 shadow-sm transition-all hover:shadow-md">
              <h4 className="text-foreground/70 text-xs font-semibold">
                {t("info.joined")}
              </h4>
              <ClientOnly
                fallback={
                  <p className="text-foreground mt-1 h-6 font-medium" />
                }
              >
                <p className="text-foreground mt-1 font-medium">
                  {joinedDate(createdAt)}
                </p>
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>
      {user.role !== "admin" && (
        <div>
          <h3 className="text-foreground pb-2 text-lg font-medium tracking-tight">
            {t("role.title")}
          </h3>
          <div className="bg-card flex flex-col gap-2 rounded-xl border p-4 shadow-sm transition-all hover:shadow-md md:flex-row md:items-center md:justify-between">
            <h4 className="text-foreground/70 text-xs font-semibold">
              {existingRequest?.status === "pending"
                ? t("role.pending")
                : existingRequest
                  ? t("role.rejected")
                  : t("role.description")}
            </h4>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRoleRequest(true)}
            >
              {existingRequest?.status === "pending"
                ? t("actions.viewRequest")
                : t("actions.requestRole")}
            </Button>
          </div>
        </div>
      )}
      <div>
        <h3 className="text-foreground pb-2 text-lg font-medium tracking-tight">
          {t("delete.title")}
        </h3>
        <div className="bg-card flex flex-col gap-2 rounded-xl border p-4 shadow-sm transition-all hover:shadow-md md:flex-row md:items-center md:justify-between">
          <h4 className="text-foreground/70 text-xs font-semibold">
            {t("delete.description")}
          </h4>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={() => setShowConfirmation(true)}
          >
            {t("actions.delete")}
          </Button>
        </div>
      </div>

      {showEditProfileForm && (
        <ProfileForm
          profile={profile}
          user={user}
          onClose={() => setShowEditProfileForm(false)}
        />
      )}
      {showRoleRequest && (
        <RoleRequestDialog
          user={user}
          existingRequest={existingRequest}
          onClose={() => setShowRoleRequest(false)}
        />
      )}
      {showConfirmation && (
        <ConfirmationModal
          type="delete"
          btnLabel={t("delete.confirmLabel")}
          isLoading={isLoading}
          handleCancel={() => setShowConfirmation(false)}
          handleAction={handleRequestClosure}
        >
          {t("delete.confirm")}
        </ConfirmationModal>
      )}
    </section>
  );
}
