import { useTranslation } from "react-i18next";
import { CircleCheck, CircleX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import type { AuthResult } from "@/types/auth";
import { verifyEmailVerificationFn } from "@/server/functions/auth";

import { Button } from "@/components/ui/button";
import SpinnerMini from "@/components/shared/SpinnerMini";

export default function VerifySection({ token }: { token: string }) {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");

  const pending = useRef<Promise<AuthResult> | null>(null);
  const [result, setResult] = useState<AuthResult | null>(null);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    pending.current ??= verifyEmailVerificationFn({ data: token });
    pending.current.then((data) => {
      if (!active) return;
      setResult(data);
      if (data.success) {
        timer = setTimeout(() => navigate({ to: "/sign-in" }), 2000);
      }
    });

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [token, navigate]);

  return (
    <div className="grid gap-3 pb-3">
      {result === null && (
        <div className="bg-card text-muted-foreground flex gap-2 rounded-xl border p-3">
          <SpinnerMini />
          <span>{t("verify.verifying")}</span>
        </div>
      )}
      {result?.success && (
        <div className="bg-card text-muted-foreground flex gap-2 rounded-xl border p-3">
          <CircleCheck className="stroke-success h-6 w-6 shrink-0" />
          <span>{t(`results.${result.code}`)}</span>
        </div>
      )}
      {result && !result.success && (
        <>
          <div className="bg-card text-muted-foreground flex gap-2 rounded-xl border p-3">
            <CircleX className="stroke-destructive h-6 w-6 shrink-0" />
            <span>{t(`results.${result.code}`)}</span>
          </div>
          <Button type="button" onClick={() => navigate({ to: "/" })}>
            {t("verify.goHome")}
          </Button>
        </>
      )}
    </div>
  );
}
