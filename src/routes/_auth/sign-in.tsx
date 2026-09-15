import { toast } from "sonner";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { Trans, useTranslation } from "react-i18next";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import { signIn } from "@/lib/auth-client";
import { signInFormSchema } from "@/lib/schema";
import { getSession } from "@/server/functions/auth";

import Logo from "@/components/layout/Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export const Route = createFileRoute("/_auth/sign-in")({
  beforeLoad: async () => {
    const session = await getSession();

    if (session) {
      throw redirect({
        to: "/classroom",
      });
    }

    return;
  },
  component: SignIn,
});

function SignIn() {
  const { t } = useTranslation("auth", { keyPrefix: "signIn" });
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
          callbackURL: "/classroom",
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

  return (
    <section className="relative flex min-h-[90dvh] items-center justify-center px-8 py-32 md:grid md:h-full md:px-20 md:py-0">
      <div className="container">
        <div className="flex flex-col items-center gap-2">
          <Link to="/">
            <Logo />
          </Link>
          <Card className="mx-auto flex flex-col gap-4 border-0 bg-transparent shadow-none md:w-[24rem]">
            <CardHeader className="w-full text-center text-2xl font-medium tracking-tighter">
              {t("title")}
            </CardHeader>
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
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Checkbox
                      disabled={isLoading}
                      checked={rememberMe}
                      onCheckedChange={handleToggleRememberMe}
                    />
                    {t("fields.rememberMe")}
                  </label>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  className="p-0 hover:bg-transparent"
                >
                  <Link
                    to="/"
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
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!canSubmit}
                  >
                    {t("actions.submit")}
                  </Button>
                )}
              />
            </form>
            <Button
              variant="outline"
              onClick={async () => {
                await signIn.social({
                  provider: "google",
                  callbackURL: "/classroom",
                  errorCallbackURL: "/error",
                });
              }}
              disabled={isLoading}
            >
              <svg
                viewBox="0 0 24 24"
                className="fill-primary disabled:fill-primary/90 size-5"
              >
                <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 01-5.279-5.28 5.27 5.27 0 015.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 00-8.934 8.934 8.907 8.907 0 008.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" />
              </svg>
              {t("actions.google")}
            </Button>
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
                    <Link to="/terms" className="font-medium hover:underline" />
                  ),
                  privacyLink: (
                    <Link
                      to="/privacy"
                      className="font-medium hover:underline"
                    />
                  ),
                }}
              />
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
