import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";

import { signUp } from "@/lib/auth-client";
import { signUpFormSchema } from "@/lib/schema";
import { sendVerificationEmailFn } from "@/server/functions/auth";

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

export default function SignUpForm() {
  const navigate = useNavigate();
  const { t } = useTranslation("auth", { keyPrefix: "signUp" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [honeyPot, setHoneyPot] = useState("");

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      agreeToPolicy: false,
    },
    validators: {
      onChange: signUpFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (honeyPot) return;
      setShowPassword(false);
      await signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.fullName,
          callbackURL: "/sign-in",
        },
        {
          onRequest: () => setIsLoading(true),
          onResponse: () => setIsLoading(false),
          onSuccess: async () => {
            const result = await sendVerificationEmailFn({
              data: {
                email: value.email,
                name: value.fullName.split(" ")[0] ?? value.fullName,
              },
            });

            if (!result.success) {
              toast.error(t("messages.errors.emailSendFailed"));
            } else {
              toast.success(t("messages.success"));
            }

            await navigate({ to: "/sign-in" });
          },
          onError: (ctx) => {
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

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field
          name="fullName"
          children={(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t("fields.fullName.label")}
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                type="text"
                disabled={isLoading}
                placeholder={t("fields.fullName.placeholder")}
              />
              {field.state.meta.isTouched &&
              field.state.meta.errors.length > 0 ? (
                <FieldError errors={field.state.meta.errors} />
              ) : null}
            </Field>
          )}
        />
        <form.Field
          name="email"
          children={(field) => (
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
          )}
        />
        <form.Field
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
        <form.Field
          name="agreeToPolicy"
          children={(field) => (
            <Field>
              <label
                htmlFor={field.name}
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Checkbox
                  id={field.name}
                  disabled={isLoading}
                  checked={field.state.value}
                  onCheckedChange={(checked) =>
                    field.handleChange(checked === true)
                  }
                />
                <p>
                  <Trans
                    i18nKey="fields.agree"
                    t={t}
                    components={{
                      privacyLink: (
                        <Link
                          to="/privacy"
                          target="_blank"
                          className="font-medium underline"
                        />
                      ),
                      termsLink: (
                        <Link
                          to="/terms"
                          target="_blank"
                          className="font-medium underline"
                        />
                      ),
                    }}
                  />
                </p>
              </label>
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
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit]) => (
            <Button
              type="submit"
              className="w-full"
              disabled={!canSubmit || isLoading}
            >
              {t("actions.submit")}
            </Button>
          )}
        />
      </form>
      <SignInGoogleButton isLoading={isLoading} />
    </>
  );
}
