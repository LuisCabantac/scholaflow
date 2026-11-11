import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { CircleCheck, CircleX } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import type { AuthResult } from "@/lib/auth-result";
import { authKeys } from "@/queries/auth";
import { closeUserAccountFn } from "@/server/functions/auth";

import { Button } from "@/components/ui/button";

export default function CloseAccountSection({ token }: { token: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AuthResult | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const data = await closeUserAccountFn({ data: token }).catch(
      (): AuthResult => ({ success: false, code: "closeFailed" }),
    );
    setResult(data);
    setIsLoading(false);

    if (data.success) {
      queryClient.removeQueries({ queryKey: authKeys.session() });
      toast.success(t(`results.${data.code}`));
      await navigate({ to: "/sign-in" });
    } else {
      toast.error(t(`results.${data.code}`));
    }
  }

  return (
    <form className="grid gap-3 pb-3" onSubmit={handleSubmit}>
      {result?.success && (
        <div className="bg-card text-muted-foreground flex gap-2 rounded-xl border p-3">
          <CircleCheck className="stroke-success h-6 w-6 shrink-0" />
          <span>{t(`results.${result.code}`)}</span>
        </div>
      )}
      {result && !result.success && (
        <div className="bg-card text-muted-foreground flex gap-2 rounded-xl border p-3">
          <CircleX className="stroke-destructive h-6 w-6 shrink-0" />
          <span>{t(`results.${result.code}`)}</span>
        </div>
      )}
      <Button type="submit" disabled={isLoading}>
        {isLoading
          ? t("closeAccount.actions.submitting")
          : t("closeAccount.actions.submit")}
      </Button>
    </form>
  );
}
