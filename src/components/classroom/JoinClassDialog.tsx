import { useRef } from "react";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

import { useClickOutside } from "@/hooks/use-click-outside";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function JoinClassDialog({
  isLoading,
  onJoinClass,
  onClose,
}: {
  isLoading: boolean;
  onJoinClass: (code: string) => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useTranslation(["classroom", "common"]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onJoinClass((formData.get("classCode") as string) ?? "");
  }

  useClickOutside(wrapperRef, onClose, isLoading);

  return (
    <motion.div
      className="modal__container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
    >
      <motion.div
        className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[30%]"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="md:w-[25rem]" ref={wrapperRef}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-lg font-semibold tracking-tight">
                {t("join.title")}
              </h3>
              <Button
                className="hover:bg-transparent"
                variant="ghost"
                type="button"
                size="icon"
                disabled={isLoading}
                onClick={onClose}
              >
                <X className="stroke-foreground size-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <Input
                disabled={isLoading}
                required
                type="text"
                name="classCode"
                maxLength={8}
                placeholder={t("join.placeholder")}
              />
              <div className="flex items-center justify-end gap-2">
                {!isLoading && (
                  <Button type="button" variant="secondary" onClick={onClose}>
                    {t("common:actions.cancel")}
                  </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                  {t("actions.join")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
