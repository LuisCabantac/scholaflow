import { Dispatch, SetStateAction, useRef } from "react";

import { useClickOutside } from "@/contexts/ClickOutsideContext";

import Button from "@/components/Button";

export default function JoinClassDialog({
  isLoading,
  onJoinClass,
  onShowJoinClass,
  setShowJoinClass,
}: {
  isLoading: boolean;
  onShowJoinClass: () => void;
  onJoinClass: (event: React.FormEvent) => Promise<void>;
  setShowJoinClass: Dispatch<SetStateAction<boolean>>;
}) {
  const { useClickOutsideHandler } = useClickOutside();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useClickOutsideHandler(
    wrapperRef,
    () => {
      setShowJoinClass(false);
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
            <h4 className="text-lg font-semibold tracking-tight">Join class</h4>
            <p>
              Ask your teacher for the class code and enter it here to join the
              class.
            </p>
          </div>
          <form onSubmit={onJoinClass} className="grid gap-4">
            <input
              disabled={isLoading}
              required
              type="text"
              name="classCode"
              maxLength={8}
              className="focus:outline-t-2 w-full rounded-md border-2 border-[#dbe4ff] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none"
              placeholder="Enter code here..."
            />
            <div className="flex items-center justify-end gap-2">
              {!isLoading && (
                <Button type="secondary" onClick={onShowJoinClass}>
                  Cancel
                </Button>
              )}
              <Button type="primary" isLoading={isLoading}>
                Join
              </Button>
            </div>
          </form>
          <button
            type="button"
            className="absolute right-4 top-4 disabled:cursor-not-allowed"
            disabled={isLoading}
            onClick={onShowJoinClass}
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
