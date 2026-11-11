import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

import { signIn } from "@/lib/auth-client";
import { resolveRedirect } from "@/lib/redirect";
import { signInFormSchema } from "@/lib/schema";
import { authKeys } from "@/queries/auth";

import AuthCard from "@/components/auth/AuthCard";
import SignInGoogleButton from "@/components/auth/SignInGoogleButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export const Route = createFileRoute("/_auth/sign-in")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Sign in | ScholaFlow" },
      {
        name: "description",
        content:
          "Sign in to access your classes, assignments, and connect with your classmates.",
      },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const { t } = useTranslation("auth", { keyPrefix: "signIn" });
  const { redirect } = Route.useSearch();
  const queryClient = useQueryClient();
  const callbackURL = resolveRedirect(redirect);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [honeyPot, setHoneyPot] = useState("");

  const signInForm = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: signInFormSchema,
    },
    onSubmit: async ({ value: { email, password } }) => {
      if (honeyPot) return;
      setShowPassword(false);
      await signIn.email(
        {
          email: email,
          password: password,
          callbackURL,
          rememberMe,
        },
        {
          onRequest: () => {
            setIsLoading(true);
          },
          onResponse: () => {
            setIsLoading(false);
          },
          onSuccess: () => {
            queryClient.removeQueries({ queryKey: authKeys.session() });
            toast.success(t("messages.success"));
          },
          onError: (ctx) => {
            if (ctx.error.status === 401) {
              toast.error(t("messages.errors.invalidCredentials"));
              return;
            }
            if (ctx.error.status === 403) {
              toast.error(t("messages.errors.verifyEmail"));
              return;
            }
            toast.error(ctx.error.message);
          },
        },
      );
    },
  });

  function handleShowPassword(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setShowPassword(!showPassword);
  }

  function handleToggleRememberMe() {
    setRememberMe(!rememberMe);
  }

  const footer = (
    <>
      <p className="flex items-center justify-center gap-1 text-sm">
        {t("links.dontHaveAccount")}
        <Link to="/sign-up" className="font-medium hover:underline">
          {t("links.signUp")}
        </Link>
      </p>
      <p className="mx-8 mt-4 text-center text-sm">
        <Trans
          i18nKey="legal.termsAgreement"
          t={t}
          components={{
            termsLink: (
              <Link
                to="/terms"
                target="_blank"
                className="font-medium hover:underline"
              />
            ),
            privacyLink: (
              <Link
                to="/privacy"
                target="_blank"
                className="font-medium hover:underline"
              />
            ),
          }}
        />
      </p>
    </>
  );

  return (
    <AuthCard title={t("title")} footer={footer}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          signInForm.handleSubmit();
        }}
        className="space-y-4"
      >
        <signInForm.Field
          name="email"
          children={(field) => {
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t("fields.email.label")}
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  type="email"
                  disabled={isLoading}
                  placeholder={t("fields.email.placeholder")}
                />
                {field.state.meta.isTouched &&
                field.state.meta.errors.length > 0 ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
              </Field>
            );
          }}
        />
        <signInForm.Field
          name="password"
          children={(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t("fields.password.label")}
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  disabled={isLoading}
                  type={showPassword ? "text" : "password"}
                  placeholder={t("fields.password.placeholder")}
                />
                <InputGroupAddon align="inline-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleShowPassword}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </InputGroupAddon>
              </InputGroup>
              {field.state.meta.isTouched &&
              field.state.meta.errors.length > 0 ? (
                <FieldError errors={field.state.meta.errors} />
              ) : null}
            </Field>
          )}
        />
        <div className="hidden">
          <label htmlFor="verify__name">{t("fields.honeypot")}</label>
          <input
            type="text"
            id="verify__name"
            name="verify__name"
            onChange={(event) => setHoneyPot(event.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label
              htmlFor="rememberMe"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Checkbox
                id="rememberMe"
                disabled={isLoading}
                checked={rememberMe}
                onCheckedChange={handleToggleRememberMe}
              />
              {t("fields.rememberMe")}
            </label>
          </div>
          <Button asChild variant="ghost" className="p-0 hover:bg-transparent">
            <Link
              to="/forget-password"
              aria-disabled={isLoading}
              className="text-primary hover:text-primary/90 text-sm font-medium"
            >
              {t("actions.forgotPassword")}
            </Link>
          </Button>
        </div>
        <signInForm.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit]) => (
            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {t("actions.submit")}
            </Button>
          )}
        />
      </form>
      <SignInGoogleButton isLoading={isLoading} callbackURL={callbackURL} />
    </AuthCard>
  );
}
