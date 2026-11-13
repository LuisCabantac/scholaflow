import { toast } from "sonner";
import type React from "react";
import { useTranslation } from "react-i18next";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const itemClass =
  "hover:text-foreground w-full cursor-pointer p-0 focus:bg-transparent focus:text-foreground";
const destructiveItemClass =
  "w-full cursor-pointer p-0 focus:text-destructive/90 data-[variant=destructive]:focus:bg-transparent dark:data-[variant=destructive]:focus:bg-transparent";

export default function EllipsisPopover({
  showEdit,
  children,
  deleteLabel,
  clipboardUrl,
  showDelete = false,
  onShowEditForm,
  onShowConfirmationModal,
}: {
  showEdit: boolean;
  children: React.ReactNode;
  deleteLabel?: string;
  showDelete?: boolean;
  clipboardUrl?: string;
  onShowEditForm?: () => void;
  onShowConfirmationModal?: () => void;
}) {
  const { t } = useTranslation("common");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        alignOffset={8}
        collisionPadding={8}
        className="ellipsis__popover bg-card grid w-[10rem] gap-2 p-3 font-medium shadow-md"
      >
        {clipboardUrl && (
          <DropdownMenuItem
            className={itemClass}
            onSelect={async () => {
              const href = new URL(clipboardUrl, window.location.origin).href;
              await navigator.clipboard.writeText(href).then(() => {
                toast.success(t("messages.copied"));
              });
            }}
          >
            {t("popover.copyLink")}
          </DropdownMenuItem>
        )}
        {showEdit && (
          <DropdownMenuItem
            className={itemClass}
            onSelect={() => onShowEditForm?.()}
          >
            {t("popover.edit")}
          </DropdownMenuItem>
        )}
        {showDelete && (
          <DropdownMenuItem
            variant="destructive"
            className={destructiveItemClass}
            onSelect={() => onShowConfirmationModal?.()}
          >
            {deleteLabel ?? t("popover.delete")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
