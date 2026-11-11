import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { forgetPasswordFormSchema } from "@/lib/schema";
import { requestPasswordResetFn } from "@/server/functions/auth";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function ForgetPasswordForm() {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: { email: "" },
    validators: { onChange: forgetPasswordFormSchema },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      const result = await requestPasswordResetFn({ data: value.email });
      setIsLoading(false);

      if (result.success) {
        toast.success(t(`results.${result.code}`));
        await navigate({ to: "/sign-in" });
      } else {
        toast.error(t(`results.${result.code}`));
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="email"
        children={(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              {t("forgetPassword.fields.email.label")}
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
              placeholder={t("forgetPassword.fields.email.placeholder")}
            />
            {field.state.meta.isTouched &&
            field.state.meta.errors.length > 0 ? (
              <FieldError errors={field.state.meta.errors} />
            ) : null}
          </Field>
        )}
      />
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit]) => (
          <Button
            type="submit"
            className="w-full"
            disabled={!canSubmit || isLoading}
          >
            {t("forgetPassword.actions.submit")}
          </Button>
        )}
      />
    </form>
  );
}
