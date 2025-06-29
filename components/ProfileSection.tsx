"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";
import { format } from "date-fns";
import emailjs from "@emailjs/browser";
import { useQuery } from "@tanstack/react-query";

import { Session } from "@/lib/schema";
import { checkVerificationToken } from "@/lib/auth-actions";

import { Button } from "@/components/ui/button";
import ProfileForm from "@/components/ProfileForm";
import ConfirmationModal from "@/components/ConfirmationModal";

async function sendEmail(templateParams: {
  to_email: string;
  to_name: string;
}) {
  const { success, message, data } = await checkVerificationToken(
    templateParams.to_email,
    "close-account",
    "uuid",
  );

  if (!success) {
    return { success: false, message };
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
    action_url: `${process.env.NEXT_PUBLIC_APP_URL}/close-account?token=${data?.value}`,
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
        success: true,
        message:
          "Verification email sent successfully. Please check your inbox.",
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
}: {
  session: Session;
  onGetUser: (email: string) => Promise<Session | null>;
}) {
  const [showEditProfileForm, setShowEditProfileForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: user } = useQuery({
    queryKey: [`profile--${session.id}`],
    queryFn: () => onGetUser(session.email),
  });

  function handleToggleShowEditProfileForm() {
    setShowEditProfileForm(!showEditProfileForm);
  }

  function handleToggleShowConfirmation() {
    setShowConfirmation(!showConfirmation);
  }

  return (
    <section className="grid gap-4">
      <div className="mx-auto">
        <div className="flex flex-col items-center gap-y-4">
          <Image
            src={session.image ?? ""}
            alt={`${session.name}'s photo`}
            width={48}
            height={48}
            className="h-16 w-16 flex-shrink-0 rounded-full md:h-24 md:w-24"
          />
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            {session.name}
          </h3>
          <Button type="button" onClick={handleToggleShowEditProfileForm}>
            Edit Profile
          </Button>
        </div>
      </div>
      <div>
        <h3 className="pb-2 text-lg font-medium tracking-tight text-foreground">
          Personal Information
        </h3>
        <div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
              <h4 className="text-xs font-semibold text-foreground/70">
                Email
              </h4>
              <p className="mt-1 font-medium text-foreground">
                {session.email}
              </p>
            </div>
            <div className="flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
              <h4 className="text-xs font-semibold text-foreground/70">
                School
              </h4>
              <p className="mt-1 font-medium text-foreground">
                {session.schoolName ? session.schoolName : "N/A"}
              </p>
            </div>
            <div className="flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
              <h4 className="text-xs font-semibold text-foreground/70">
                Joined
              </h4>
              <p className="mt-1 font-medium text-foreground">
                {format(session.createdAt ?? "", "MMMM dd, yyyy")}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="pb-2 text-lg font-medium tracking-tight text-foreground">
          Delete account
        </h3>
        <div className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md md:flex-row md:items-center md:justify-between">
          <h4 className="text-xs font-semibold text-foreground/70">
            Permanently delete your account and all data. This cannot be undone.
          </h4>
          <Button
            variant="destructive"
            disabled={isLoading}
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
            const { success, message } = await sendEmail(templateParams);
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
