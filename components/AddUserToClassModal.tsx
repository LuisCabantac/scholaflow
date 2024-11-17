import { Dispatch, SetStateAction, useRef, useState } from "react";

import { useClickOutside } from "@/contexts/ClickOutsideContext";

import Button from "@/components/Button";
import { addUserToClass } from "@/lib/classroom-actions";
import toast from "react-hot-toast";

export default function AddUserToClassModal({
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
          className="grid w-full gap-2 rounded-md bg-[#f3f6ff] p-5"
          ref={wrapperRef}
        >
          <div className="flex gap-2">
            <p className="text-lg font-medium">Add user</p>
          </div>
          <form onSubmit={handleAddUserToClassSubmit}>
            <div className="grid gap-1 md:gap-2">
              <input type="text" name="classId" defaultValue={classId} hidden />
              <input
                disabled={isLoading}
                required
                type="email"
                name="email"
                className="focus:outline-t-2 w-full rounded-md border-2 border-[#dbe4ff] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none md:px-5 md:py-3"
                placeholder="Enter the user's email address here..."
              />
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
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
        </div>
      </div>
    </div>
  );
}
