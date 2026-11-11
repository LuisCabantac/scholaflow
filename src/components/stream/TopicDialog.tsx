import { toast } from "sonner";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import { classTopicKeys } from "@/queries/class-topic";
import type { Classroom, ClassTopic } from "@/lib/schema";
import { useClickOutside } from "@/hooks/use-click-outside";
import { createTopicFn, updateTopicFn } from "@/server/functions/class-topic";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TopicDialog({
  type,
  topic,
  classroom,
  onClose,
}: {
  type: "edit" | "create";
  topic?: ClassTopic;
  classroom: Classroom;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["stream", "common"]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  async function handleTopicSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const { success, message } = await (type === "create"
        ? createTopicFn({ data: formData })
        : updateTopicFn({ data: formData }));

      if (!success) {
        toast.error(message);
        return;
      }

      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: classTopicKeys.byClass(classroom.id),
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
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
                {type === "edit"
                  ? t("stream:topic.editTitle")
                  : t("stream:topic.createTitle")}
              </h3>
              <Button
                className="hover:bg-transparent disabled:cursor-not-allowed"
                variant="ghost"
                type="button"
                size="icon"
                disabled={isLoading}
                onClick={onClose}
                aria-label={t("stream:topic.close")}
              >
                <X className="stroke-foreground size-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTopicSubmit} className="grid gap-4">
              <input
                type="text"
                name="classroomId"
                defaultValue={classroom.id}
                hidden
              />
              <input
                type="text"
                name="topicId"
                defaultValue={topic?.id}
                hidden
              />
              <Input
                disabled={isLoading}
                required
                type="text"
                name="topicName"
                placeholder={t("stream:topic.placeholder")}
                defaultValue={topic?.name}
              />
              <div className="flex items-center justify-end gap-2">
                {!isLoading && (
                  <Button variant="secondary" type="button" onClick={onClose}>
                    {t("common:actions.cancel")}
                  </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                  {type === "edit"
                    ? t("stream:topic.saveChanges")
                    : t("stream:topic.add")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
