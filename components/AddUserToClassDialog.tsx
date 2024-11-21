import { Dispatch, SetStateAction, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useClickOutside } from "@/contexts/ClickOutsideContext";

import Button from "@/components/Button";
import { addUserToClass } from "@/lib/classroom-actions";

export default function AddUserToClassDialog({
  classId,
  onToggleShowAddUserToClass,
  handleSetShowAddUserModal,
}: {
  classId: string;
  onToggleShowAddUserToClass: () => void;
  handleSetShowAddUserModal: Dispatch<SetStateAction<boolean>>;
}) {
  const { useClickOutsideHandler } = useClickOutside();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAddUserToClassSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    const { success, message } = await addUserToClass(formData);
    if (success) {
      setIsLoading(false);
      toast.success(message);
      onToggleShowAddUserToClass();
    } else {
      setIsLoading(false);
      toast.error(message);
    }
  }

  useClickOutsideHandler(
    wrapperRef,
    () => {
      handleSetShowAddUserModal(false);
    },
    isLoading,
  );

  return (
    <div className="modal__container">
      <div className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[30%]">
        <div
          className="relative grid w-full gap-4 rounded-md bg-[#f3f6ff] p-6"
          ref={wrapperRef}
        >
          <div>
            <h4 className="text-lg font-semibold tracking-tight">
              Add user to class
            </h4>
            <p>
              Enter the email address of the user you wish to add to this class.
            </p>
          </div>
          <form onSubmit={handleAddUserToClassSubmit} className="grid gap-4">
            <input
              type="text"
              name="classroomId"
              defaultValue={classId}
              hidden
            />
            <input
              disabled={isLoading}
              required
              type="email"
              name="email"
              className="focus:outline-t-2 w-full rounded-md border-2 border-[#dbe4ff] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none"
              placeholder="Email address"
            />
            <div className="flex items-center justify-end gap-2">
              {!isLoading && (
                <Button type="secondary" onClick={onToggleShowAddUserToClass}>
                  Cancel
                </Button>
              )}
              <Button type="primary" isLoading={isLoading}>
                Add
              </Button>
            </div>
          </form>

          <button
            type="button"
            className="absolute right-4 top-4 disabled:cursor-not-allowed"
            disabled={isLoading}
            onClick={onToggleShowAddUserToClass}
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
