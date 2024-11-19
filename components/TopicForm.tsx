import { Dispatch, SetStateAction, useRef, useState } from "react";
import toast from "react-hot-toast";

import { createTopic, updateTopic } from "@/lib/classroom-actions";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import Button from "@/components/Button";
import { IClass } from "@/components/ClassroomSection";

export interface ITopic {
  topicId: string;
  topicName: string;
  classroomId: string;
}

export default function TopicForm({
  type,
  topic,
  classroom,
  onToggleShowTopic,
  onSetShowTopicForm,
}: {
  type: "edit" | "create";
  topic?: ITopic;
  classroom: IClass;
  onToggleShowTopic: () => void;
  onSetShowTopicForm: Dispatch<SetStateAction<boolean>>;
}) {
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
    } else {
      setIsLoading(false);
      toast.error(message);
    }
  }

  useClickOutsideHandler(
    wrapperRef,
    () => {
      onSetShowTopicForm(false);
    },
    isLoading,
  );

  return (
    <div className="modal__container">
      <div className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[30%]">
        <div
          className="grid w-full gap-2 rounded-md bg-[#f3f6ff] p-5"
          ref={wrapperRef}
        >
          <div className="flex gap-2">
            <p className="text-lg font-medium">
              {type === "edit" ? "Edit" : "Create"} topic
            </p>
          </div>
          <form onSubmit={handleTopicSubmit}>
            <div className="grid gap-1 md:gap-2">
              <input
                type="text"
                name="classroomId"
                defaultValue={classroom.classroomId}
                hidden
              />
              <input
                type="text"
                name="topicId"
                defaultValue={topic?.topicId}
                hidden
              />
              <input
                disabled={isLoading}
                required
                type="text"
                name="topicName"
                className="focus:outline-t-2 w-full rounded-md border-2 border-[#dbe4ff] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none md:px-5 md:py-3"
                defaultValue={topic?.topicName}
                placeholder="Enter the topic name here..."
              />
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
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
        </div>
      </div>
    </div>
  );
}
