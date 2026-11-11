import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { resetPasswordFormSchema } from "@/lib/schema";
import { updateUserPasswordFn } from "@/server/functions/auth";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export default function ResetPasswordForm({ token }: { token: string }) {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: { password: "" },
    validators: { onChange: resetPasswordFormSchema },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setShowPassword(false);
      const result = await updateUserPasswordFn({
        data: { token, newPassword: value.password },
      });
      setIsLoading(false);

      if (result.success) {
        toast.success(t(`results.${result.code}`));
        await navigate({ to: "/sign-in" });
      } else {
        toast.error(t(`results.${result.code}`));
      }
    },
  });

  function handleShowPassword(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setShowPassword(!showPassword);
  }

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
        name="password"
        children={(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              {t("resetPassword.fields.password.label")}
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
                placeholder={t("resetPassword.fields.password.placeholder")}
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
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit]) => (
          <Button
            type="submit"
            className="w-full"
            disabled={!canSubmit || isLoading}
          >
            {t("resetPassword.actions.submit")}
          </Button>
        )}
      />
    </form>
  );
}
