import toast from "react-hot-toast";

export default function EllipsisPopover({
  showEdit,
  deleteLabel,
  showEllipsis,
  clipboardUrl,
  showDelete = false,
  onShowEditForm,
  onToggleEllipsis,
  onShowConfirmationModal,
}: {
  showEdit: boolean;
  deleteLabel?: string;
  showEllipsis: boolean;
  showDelete?: boolean;
  clipboardUrl?: string;
  onShowEditForm?: () => void;
  onToggleEllipsis: () => void;
  onShowConfirmationModal?: () => void;
}) {
  return (
    <div
      className={`${showEllipsis ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-[-10px] opacity-0"} ellipsis__popover absolute right-2 z-20 grid w-[10rem] gap-2 rounded-md bg-[#f3f6ff] p-3 font-medium shadow-md transition-all ease-in-out`}
    >
      {clipboardUrl && (
        <button
          type="button"
          className="flex w-full items-center gap-1 rounded-md hover:text-[#242628]"
          onClick={async () => {
            await navigator.clipboard.writeText(clipboardUrl).then(() => {
              toast.success("Copied to clipboard!");
              onToggleEllipsis();
            });
          }}
        >
          Copy link
        </button>
      )}
      {showEdit && (
        <button
          type="button"
          className="flex w-full items-center gap-1 rounded-md hover:text-[#242628]"
          onClick={() => {
            onShowEditForm?.();
            onToggleEllipsis();
          }}
        >
          Edit
        </button>
      )}
      {showDelete && (
        <button
          type="button"
          onClick={() => {
            onShowConfirmationModal?.();
            onToggleEllipsis();
          }}
          className="flex items-center gap-1 rounded-md text-[#f03e3e] hover:text-[#c92a2a]"
        >
          {deleteLabel ? deleteLabel : "Delete"}
        </button>
      )}
    </div>
  );
}
