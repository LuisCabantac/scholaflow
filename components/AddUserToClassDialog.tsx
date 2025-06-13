import { X } from "lucide-react";
import toast from "react-hot-toast";
import { Dispatch, SetStateAction, useRef, useState } from "react";

import { addUserToClass } from "@/lib/classroom-actions";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
        <Card className="md:w-[25rem]" ref={wrapperRef}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                Add user to class
              </h3>
              <Button
                className="hover:bg-transparent disabled:cursor-not-allowed"
                variant="ghost"
                type="button"
                size="icon"
                disabled={isLoading}
                onClick={onToggleShowAddUserToClass}
              >
                <X className="size-5 stroke-foreground" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUserToClassSubmit} className="grid gap-4">
              <input
                type="text"
                name="classroomId"
                defaultValue={classId}
                hidden
              />
              <Input
                disabled={isLoading}
                required
                type="email"
                name="email"
                placeholder="Enter user's email address"
              />
              <div className="flex items-center justify-end gap-2">
                {!isLoading && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onToggleShowAddUserToClass}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                  Add
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
