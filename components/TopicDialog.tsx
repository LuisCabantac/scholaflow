import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useRef, useState } from "react";

import { Classroom, ClassTopic } from "@/lib/schema";
import { createTopic, updateTopic } from "@/lib/classroom-actions";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import Button from "@/components/Button";

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
    <div className="modal__container">
      <div className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[30%]">
        <div
          className="relative grid w-full gap-4 rounded-md bg-[#f3f6ff] p-4"
          ref={wrapperRef}
        >
          <div>
            <h4 className="text-lg font-semibold tracking-tight">
              {type === "edit" ? "Edit" : "Create"} topic
            </h4>
            <p>
              Group assignments and materials into units to help organize your
              classwork.
            </p>
          </div>
          <form onSubmit={handleTopicSubmit} className="grid gap-4">
            <input
              type="text"
              name="classroomId"
              defaultValue={classroom.id}
              hidden
            />
            <input type="text" name="topicId" defaultValue={topic?.id} hidden />
            <input
              disabled={isLoading}
              required
              type="text"
              name="topicName"
              className="focus:outline-t-2 w-full rounded-md border border-[#dddfe6] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none"
              defaultValue={topic?.name}
              placeholder="Enter the topic name here..."
            />
            <div className="flex items-center justify-end gap-2">
              {!isLoading && (
                <Button type="secondary" onClick={onToggleShowTopic}>
                  Cancel
                </Button>
              )}
              <Button type="primary" isLoading={isLoading}>
                {type === "edit" ? "Save changes" : "Add"}
              </Button>
            </div>
          </form>
          <button
            type="button"
            className="absolute right-4 top-4 disabled:cursor-not-allowed"
            disabled={isLoading}
            onClick={onToggleShowTopic}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-5 transition-all hover:stroke-[#656b70]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
