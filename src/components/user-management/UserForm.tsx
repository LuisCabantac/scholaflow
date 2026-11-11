import { toast } from "sonner";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";

import type { User } from "@/lib/schema";
import { userKeys } from "@/queries/user";
import { useClickOutside } from "@/hooks/use-click-outside";
import type { UserFormType } from "@/types/user-management";
import { createUserFn, updateUserFn } from "@/server/functions/user-management";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function UserForm({
  type,
  user,
  onClose,
}: {
  type: UserFormType;
  user?: User;
  onClose: () => void;
}) {
  const { t } = useTranslation("userManagement", { keyPrefix: "form" });
  const queryClient = useQueryClient();

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");

  useClickOutside(wrapperRef, onClose, isLoading);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const result =
        type === "create"
          ? await createUserFn({ data: { name, email, password } })
          : await updateUserFn({
              data: { userId: user?.id ?? "", name, email },
            });

      setEmailTaken(result.code === "emailTaken");

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
      onClose();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="modal__container">
      <AnimatePresence>
        <motion.div
          className="bg-card fixed right-0 bottom-0 left-0 z-10 h-[95%] overflow-y-scroll rounded-t-2xl"
          ref={wrapperRef}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{
            type: "spring",
            damping: 32,
            stiffness: 300,
            mass: 1,
            duration: 0.2,
          }}
        >
          <form
            className="bg-card min-h-screen w-full rounded-t-md border-t pb-[6rem] shadow-sm"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center justify-between px-4 py-4 md:px-8 md:py-8">
              <h3 className="text-foreground text-lg font-semibold tracking-tight">
                {type === "edit" ? t("editTitle") : t("createTitle")}
              </h3>
              <button
                className="disabled:cursor-not-allowed"
                type="button"
                aria-label={t("close")}
                disabled={isLoading}
                onClick={onClose}
              >
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="hover:stroke-foreground size-5 transition-all"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="grid gap-4 px-4 pb-4 md:px-8 md:pb-8">
              <div className="grid gap-2">
                <Label htmlFor="user-form-name">
                  {t("fullName")} <span className="text-red-400">*</span>
                </Label>
                <Input
                  required
                  id="user-form-name"
                  type="text"
                  name="name"
                  placeholder={t("fullNamePlaceholder")}
                  value={name}
                  disabled={isLoading}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-form-email">
                  {t("email")} <span className="text-red-400">*</span>
                </Label>
                <Input
                  required
                  id="user-form-email"
                  type="email"
                  name="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  disabled={isLoading}
                  aria-invalid={emailTaken || undefined}
                  className={emailTaken ? "border-red-500" : ""}
                  onChange={(event) => {
                    setEmailTaken(false);
                    setEmail(event.target.value);
                  }}
                />
              </div>
              {type === "create" && (
                <div className="grid gap-2">
                  <Label htmlFor="user-form-password">
                    {t("password")} <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    required
                    id="user-form-password"
                    type="password"
                    name="password"
                    minLength={8}
                    maxLength={20}
                    autoComplete="new-password"
                    placeholder={t("passwordPlaceholder")}
                    value={password}
                    disabled={isLoading}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="bg-card fixed right-0 bottom-0 left-0 flex w-auto items-center justify-end gap-2 border-t px-4 py-4 md:px-8">
              {!isLoading && (
                <Button type="button" variant="secondary" onClick={onClose}>
                  {t("cancel")}
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {type === "edit" ? t("save") : t("create")}
              </Button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
