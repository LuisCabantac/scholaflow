import { toast } from "sonner";
import { useTranslation } from "react-i18next";

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
      inert={!showEllipsis}
      className={`${showEllipsis ? "translate-y-0 scale-100 opacity-100 duration-150" : "-translate-y-1 scale-95 opacity-0 duration-100"} ellipsis__popover bg-card absolute right-2 z-20 grid w-[10rem] origin-top-right gap-2 rounded-xl border p-3 font-medium shadow-md transition-[opacity,translate,scale] ease-out motion-reduce:transition-none`}
    >
      {clipboardUrl && (
        <button
          type="button"
          className="hover:text-foreground flex w-full items-center gap-1 rounded-md"
          onClick={async () => {
            const href = new URL(clipboardUrl, window.location.origin).href;
            await navigator.clipboard.writeText(href).then(() => {
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
