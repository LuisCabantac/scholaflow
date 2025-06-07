"use client";

import Image from "next/image";
import { useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import emailjs from "@emailjs/browser";
import { useQuery } from "@tanstack/react-query";

import { uuidv4Id, RoleRequest, Session, Verification } from "@/lib/schema";

import Button from "@/components/Button";
import ProfileForm from "@/components/ProfileForm";
import RoleRequestDialog from "@/components/RoleRequestDialog";
import ConfirmationModal from "@/components/ConfirmationModal";

async function sendEmail(
  templateParams: {
    to_email: string;
    to_name: string;
  },
  onGetVerificationToken: (email: string) => Promise<Verification | null>,
  onGenerateVerificationToken: (email: string) => Promise<Verification | null>,
) {
  const existingToken = await onGetVerificationToken(templateParams.to_email);

  if (existingToken && uuidv4Id.safeParse(existingToken.value).success) {
    const hasExpired = new Date(existingToken.expiresAt) < new Date();

    if (!hasExpired) {
      return {
        success: false,
        message:
          "A verification email was already sent. Please check your inbox or wait for the current link to expire before requesting a new one.",
      };
    }
  }

  const verification = await onGenerateVerificationToken(
    templateParams.to_email,
  );

  if (!verification) {
    return {
      success: false,
      message:
        "Failed to generate verification token. Please try again later or contact support if the issue persists.",
    };
  }
  const newTemplateParams = {
    ...templateParams,
    email_subject: "Confirm Your ScholaFlow Account Deletion",
    email_title: "Account Closure Request",
    email_description:
      "We received a request to close your ScholaFlow account. If this was you, please click the button below to confirm and permanently delete your account:",
    button_color: "#dc2626",
    button_text: "Confirm Account Closure",
    warning_message:
      "This action cannot be undone. All your data will be permanently deleted.",
    action_url: `${process.env.NEXT_PUBLIC_APP_URL}/close-account?token=${verification?.value}`,
    footer_message:
      "If you didn't request this account closure, please ignore this email or contact our support team.",
  };

  await emailjs
    .send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "",
      process.env.NEXT_PUBLIC_EMAILJS_CLOSE_ACCOUNT_TEMPLATE_ID ?? "",
      {
        ...newTemplateParams,
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "",
    )
    .then(() => {
      return {
        success: false,
        message:
          "Failed to send verification email. Please check your internet connection and try again, or contact support if the issue persists.",
      };
    })
    .catch(() => {
      return {
        success: false,
        message:
          "Failed to send verification email. Please check your internet connection and try again, or contact support if the issue persists.",
      };
    });

  return {
    success: true,
    message: "Verification email sent successfully. Please check your inbox.",
  };
}

export default function ProfileSection({
  session,
  onGetUser,
  existingRequest,
  onGetVerificationToken,
  onGenerateVerificationToken,
}: {
  session: Session;
  onGetUser: (email: string) => Promise<Session | null>;
  existingRequest: RoleRequest | null;
  onGetVerificationToken: (email: string) => Promise<Verification | null>;
  onGenerateVerificationToken: (email: string) => Promise<Verification | null>;
}) {
  const [showEditProfileForm, setShowEditProfileForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showRoleRequest, setShowRoleRequest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: user, isPending: userIsPending } = useQuery({
    queryKey: [`profile--${session.id}`],
    queryFn: () => onGetUser(session.email),
  });

  function handleToggleShowEditProfileForm() {
    setShowEditProfileForm(!showEditProfileForm);
  }

  function handleToggleShowRoleRequest() {
    setShowRoleRequest(!showRoleRequest);
  }

  function handleToggleShowConfirmation() {
    setShowConfirmation(!showConfirmation);
  }

  return (
    <section className="grid gap-2">
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
                src={session.image ?? ""}
                alt={`${session.name}'s photo`}
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
                <h2 className="text-lg font-semibold">{session.name}</h2>
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
              className={`role flex items-center justify-center rounded-md px-3 py-1.5 text-[0.7rem] font-semibold uppercase ${session.role === "admin" ? "admin" : session.role === "student" ? "student" : session.role === "teacher" ? "teacher" : "guest"}`}
            >
              {session.role}
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
                <p className="font-medium">{session.email}</p>
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
                  {session.schoolName ? session.schoolName : "N/A"}
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
                  {format(session.createdAt ?? "", "MMMM dd, yyyy")}
                </p>
              )}
              <h4 className="text-xs font-medium text-[#616572]">Joined</h4>
            </div>
          </div>
          {!userIsPending && session.role !== "teacher" && (
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
      <div className="grid rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 md:p-4">
        <h3 className="font-medium tracking-tight">Delete account</h3>
        <div className="flex flex-col items-start gap-x-8 gap-y-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-[#616572]">
            Permanently delete your account and all data. This cannot be undone.
          </p>
          <Button
            type="primary"
            bg="bg-[#f03e3e] hover:bg-[#c92a2a]"
            isLoading={isLoading}
            onClick={handleToggleShowConfirmation}
          >
            Delete
          </Button>
        </div>
      </div>
      {showEditProfileForm && (
        <ProfileForm
          user={user}
          session={session}
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
      {showConfirmation && (
        <ConfirmationModal
          type="delete"
          btnLabel="Delete account"
          isLoading={isLoading}
          handleCancel={handleToggleShowConfirmation}
          handleAction={async () => {
            setIsLoading(true);
            const templateParams = {
              to_email: session.email,
              to_name: session.name.split(" ")[0],
            };
            const { success, message } = await sendEmail(
              templateParams,
              onGetVerificationToken,
              onGenerateVerificationToken,
            );
            if (success) {
              setShowConfirmation(false);
              toast.success(message);
            } else {
              toast.error(message);
            }
            setIsLoading(false);
          }}
        >
          Are you sure your want to delete your account?
        </ConfirmationModal>
      )}
    </section>
  );
}
