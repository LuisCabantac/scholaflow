import { motion } from "motion/react";
import { Trash2 } from "lucide-react";
import React, { startTransition, useRef } from "react";

import { useClickOutside } from "@/contexts/ClickOutsideContext";

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
  children: React.ReactNode;
  handleCancel: () => void;
  handleAction: () => void;
}) {
  const { useClickOutsideHandler } = useClickOutside();
  const wrapperRef = useRef<HTMLDivElement>(null);

  function handleOnAction() {
    startTransition(() => {
      handleAction();
    });
  }

  useClickOutsideHandler(
    wrapperRef,
    () => {
      handleCancel();
    },
    isLoading,
  );

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
              <Trash2 className="size-6 flex-shrink-0" />
              <p className="font-medium text-foreground">{children}</p>
            </div>
            <div className="flex items-center justify-end gap-2">
              {!isLoading && (
                <Button variant="secondary" onClick={handleCancel}>
                  Cancel
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
