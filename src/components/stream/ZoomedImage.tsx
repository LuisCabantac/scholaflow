import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { useClickOutside } from "@/hooks/use-click-outside";

export default function ZoomedImage({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  const { t } = useTranslation("stream", { keyPrefix: "card" });

  const wrapperRef = useRef<HTMLDivElement>(null);

  useClickOutside(wrapperRef, onClose, false);

  return (
    <div className="modal__container">
      <button
        type="button"
        className="absolute top-2 right-2"
        onClick={onClose}
        aria-label={t("zoomClose")}
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="size-6 stroke-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </button>
      <div
        className="flex max-h-full max-w-full items-center justify-center"
        ref={wrapperRef}
      >
        <img
          src={src}
          alt={src}
          width={500}
          height={500}
          className="max-h-[90vh] max-w-[90vw] object-contain select-none"
          onDragStart={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
}
