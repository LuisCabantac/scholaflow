import { toast } from "sonner";
import { Clipboard } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ClassCodeCard({ code }: { code: string }) {
  const { t } = useTranslation(["stream", "common"]);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    toast.success(t("common:messages.copied"));
  }

  return (
    <Card>
      <CardHeader className="px-4 pt-4 pb-0 text-lg font-medium tracking-tight">
        {t("stream:aside.classCode")}
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <p className="text-sidebar-accent-foreground text-lg">{code}</p>
        <Button
          variant="ghost"
          className="h-10 w-10"
          onClick={copyCode}
          aria-label={t("stream:aside.copy")}
        >
          <Clipboard className="stroke-primary h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
}
