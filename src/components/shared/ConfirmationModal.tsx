import { Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { type ReactNode, startTransition, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useClickOutside } from "@/hooks/use-click-outside";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ConfirmationModal({
  type,
  btnLabel,
  isLoading,
  children,
  handleCancel,
  handleAction,
}: {
  type: "delete" | string;
  btnLabel: string;
  isLoading: boolean;
  children: ReactNode;
  handleCancel: () => void;
  handleAction: () => void;
}) {
  const { t } = useTranslation("common");

  const wrapperRef = useRef<HTMLDivElement>(null);

  function handleOnAction() {
    startTransition(() => {
      handleAction();
    });
  }

  useClickOutside(wrapperRef, handleCancel, isLoading);

  return (
    <motion.div
      className="modal__container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
    >
      <motion.div
        className="flex h-[40%] max-w-[78%] items-center justify-center md:h-[60%] md:max-w-[40%]"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card ref={wrapperRef}>
          <CardContent className="pt-4">
            <div className="mb-4 flex gap-2">
              <Trash2 className="size-6 shrink-0" />
              <p className="text-foreground font-medium">{children}</p>
            </div>
            <div className="flex items-center justify-end gap-2">
              {!isLoading && (
                <Button variant="secondary" onClick={handleCancel}>
                  {t("actions.cancel")}
                </Button>
              )}
              <Button
                variant={type === "delete" ? "destructive" : "default"}
                onClick={handleOnAction}
                disabled={isLoading}
              >
                {btnLabel}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
