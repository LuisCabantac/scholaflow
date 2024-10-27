import React, { useRef } from "react";

import { useClickOutside } from "@/contexts/ClickOutsideContext";

import Button from "@/components/Button";

export default function ConfirmationScreen({
  type,
  btnLabel,
  children,
  handleCancel,
  handleAction,
}: {
  type: "delete" | string;
  btnLabel: string;
  children: React.ReactNode;
  handleCancel: () => void;
  handleAction: () => void;
}) {
  const { useClickOutsideHandler } = useClickOutside();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useClickOutsideHandler(wrapperRef, () => {
    handleCancel();
  });

  return (
    <div className="confirmation__container">
      <div className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[30%]">
        <div
          className="grid gap-2 rounded-md bg-[#f3f6ff] p-4"
          ref={wrapperRef}
        >
          <div className="flex gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-6 flex-shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
            <p className="font-medium">{children}</p>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button type="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="primary"
              bg={`${type === "delete" ? "bg-[#f03e3e] hover:bg-[#c92a2a]" : ""}`}
              onClick={handleAction}
            >
              {btnLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
