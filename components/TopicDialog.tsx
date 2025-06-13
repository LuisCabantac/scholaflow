import { X } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useRef, useState } from "react";

import { Classroom, ClassTopic } from "@/lib/schema";
import { createTopic, updateTopic } from "@/lib/classroom-actions";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TopicDialog({
  type,
  topic,
  classroom,
  onToggleShowTopic,
  onSetShowTopicDialog,
}: {
  type: "edit" | "create";
  topic?: ClassTopic;
  classroom: Classroom;
  onToggleShowTopic: () => void;
  onSetShowTopicDialog: Dispatch<SetStateAction<boolean>>;
}) {
  const queryClient = useQueryClient();
  const { useClickOutsideHandler } = useClickOutside();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleTopicSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    const { success, message } = await (type === "create"
      ? createTopic(formData)
      : updateTopic(formData));
    if (success) {
      setIsLoading(false);
      toast.success(message);
      onToggleShowTopic();
      queryClient.invalidateQueries({
        queryKey: [`topics--${classroom.id}`],
      });
    } else {
      setIsLoading(false);
      toast.error(message);
    }
  }

  useClickOutsideHandler(
    wrapperRef,
    () => {
      onSetShowTopicDialog(false);
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
        className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[30%]"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="md:w-[25rem]" ref={wrapperRef}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {type === "edit" ? "Edit" : "Create"} topic
              </h3>
              <Button
                className="hover:bg-transparent disabled:cursor-not-allowed"
                variant="ghost"
                type="button"
                size="icon"
                disabled={isLoading}
                onClick={onToggleShowTopic}
              >
                <X className="size-5 stroke-foreground" />
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
                placeholder="Enter the topic name"
                defaultValue={topic?.name}
              />
              <div className="flex items-center justify-end gap-2">
                {!isLoading && (
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={onToggleShowTopic}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                  {type === "edit" ? "Save changes" : "Add"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
