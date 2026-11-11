import { useTranslation } from "react-i18next";
import { toast } from "sonner";

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
  const { t } = useTranslation("common");

  return (
    <div
      className={`${showEllipsis ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-[-10px] opacity-0"} ellipsis__popover bg-card absolute right-2 z-20 grid w-[10rem] gap-2 rounded-xl border p-3 font-medium shadow-md transition-all ease-in-out`}
    >
      {clipboardUrl && (
        <button
          type="button"
          className="hover:text-foreground flex w-full items-center gap-1 rounded-md"
          onClick={async () => {
            await navigator.clipboard.writeText(clipboardUrl).then(() => {
              toast.success(t("messages.copied"));
              onToggleEllipsis();
            });
          }}
        >
          {t("popover.copyLink")}
        </button>
      )}
      {showEdit && (
        <button
          type="button"
          className="hover:text-foreground flex w-full items-center gap-1 rounded-md"
          onClick={() => {
            onShowEditForm?.();
            onToggleEllipsis();
          }}
        >
          {t("popover.edit")}
        </button>
      )}
      {showDelete && (
        <button
          type="button"
          onClick={() => {
            onShowConfirmationModal?.();
            onToggleEllipsis();
          }}
          className="text-destructive hover:text-destructive/90 flex items-center gap-1 rounded-md"
        >
          {deleteLabel ?? t("popover.delete")}
        </button>
      )}
    </div>
  );
}
