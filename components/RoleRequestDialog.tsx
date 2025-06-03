import { Dispatch, SetStateAction, useRef, useState } from "react";
import toast from "react-hot-toast";

import { ISession } from "@/lib/auth";
import { roleRequest } from "@/lib/user-management-actions";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import Button from "@/components/Button";

export interface IRoleRequest {
  id: string;
  avatar: string;
  userId: string;
  userName: string;
  userEmail: string;
  created_at: string;
  status: "pending" | "rejected";
}

export default function RoleRequestDialog({
  session,
  existingRequest,
  onToggleShowRoleRequest,
  handleSetShowRoleRequest,
}: {
  session: ISession;
  existingRequest: IRoleRequest | null;
  onToggleShowRoleRequest: () => void;
  handleSetShowRoleRequest: Dispatch<SetStateAction<boolean>>;
}) {
  const { useClickOutsideHandler } = useClickOutside();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmitRoleRequest(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    const { success, message } = await roleRequest(formData);
    if (success) {
      setIsLoading(false);
      toast.success(message);
      onToggleShowRoleRequest();
    } else {
      setIsLoading(false);
      toast.error(message);
    }
  }

  useClickOutsideHandler(
    wrapperRef,
    () => {
      handleSetShowRoleRequest(false);
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
              Role request
            </h4>
            {existingRequest ? (
              <>
                <p>
                  Your request is currently under review. You cannot submit a
                  new request while this is pending.
                </p>
              </>
            ) : (
              <p>
                Become a Teacher and manage your digital classroom. Create and
                organize classes, assignments, and grading workflows.
              </p>
            )}
          </div>
          {!existingRequest && (
            <form className="grid gap-4" onSubmit={handleSubmitRoleRequest}>
              <input
                type="text"
                name="userId"
                defaultValue={session.id}
                hidden
              />
              <input
                type="text"
                name="userName"
                defaultValue={session.name}
                hidden
              />
              <input
                type="text"
                name="userEmail"
                defaultValue={session.email}
                hidden
              />
              <input
                type="text"
                name="avatar"
                defaultValue={session.image ?? ""}
                hidden
              />
              <div className="flex items-center justify-end gap-2">
                {!isLoading && (
                  <Button type="secondary" onClick={onToggleShowRoleRequest}>
                    Cancel
                  </Button>
                )}
                <Button type="primary" isLoading={isLoading}>
                  Request
                </Button>
              </div>
            </form>
          )}
          <button
            type="button"
            className="absolute right-4 top-4 disabled:cursor-not-allowed"
            disabled={isLoading}
            onClick={onToggleShowRoleRequest}
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
