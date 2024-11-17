import toast from "react-hot-toast";

export default function EllipsisPopover({
  showEdit,
  deleteLabel,
  showEllipsis,
  clipboardUrl,
  showDelete = false,
  onShowEditForm,
  onToggleEllipsis,
  onShowConfirmationScreen,
}: {
  showEdit: boolean;
  deleteLabel?: string;
  showEllipsis: boolean;
  showDelete?: boolean;
  clipboardUrl?: string;
  onShowEditForm?: () => void;
  onToggleEllipsis: () => void;
  onShowConfirmationScreen?: () => void;
}) {
  return (
    <div
      className={`${showEllipsis ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-[-10px] opacity-0"} ellipsis__popover absolute right-2 z-20 grid w-[10rem] gap-2 rounded-md bg-[#f3f6ff] p-3 font-medium shadow-md transition-all ease-in-out`}
    >
      {clipboardUrl && (
        <button
          type="button"
          className="flex w-full items-center gap-1 rounded-md text-sm hover:text-[#242628] md:text-base"
          onClick={() => {
            navigator.clipboard.writeText(clipboardUrl);
            toast.success("Copied to clipboard!");
            onToggleEllipsis();
          }}
        >
          Copy link
        </button>
      )}
      {showEdit && (
        <button
          type="button"
          className="flex w-full items-center gap-1 rounded-md text-sm hover:text-[#242628] md:text-base"
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
            onShowConfirmationScreen?.();
            onToggleEllipsis();
          }}
          className="flex items-center gap-1 rounded-md text-sm text-[#f03e3e] hover:text-[#c92a2a] md:text-base"
        >
          {deleteLabel ? deleteLabel : "Delete"}
        </button>
      )}
    </div>
  );
}
