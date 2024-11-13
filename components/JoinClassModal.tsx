import { Dispatch, SetStateAction, useRef } from "react";

import { useClickOutside } from "@/contexts/ClickOutsideContext";

import Button from "@/components/Button";

export default function JoinClassModal({
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
    <div className="confirmation__container">
      <div className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[30%]">
        <div
          className="grid gap-2 rounded-md bg-[#f3f6ff] p-5"
          ref={wrapperRef}
        >
          <p className="text-lg font-medium">
            Enter your subject&apos;s class code
          </p>

          <form onSubmit={onJoinClass}>
            <div className="grid gap-1 md:gap-2">
              <input
                disabled={isLoading}
                required
                type="text"
                name="classCode"
                maxLength={8}
                className="focus:outline-t-2 w-full rounded-md border-2 border-[#dbe4ff] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none md:px-5 md:py-3"
                placeholder="Enter code here..."
              />
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
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
        </div>
      </div>
    </div>
  );
}
