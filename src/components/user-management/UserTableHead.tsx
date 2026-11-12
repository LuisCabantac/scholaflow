import { useTranslation } from "react-i18next";

export default function UserTableHead() {
  const { t } = useTranslation("userManagement", { keyPrefix: "table" });

  return (
    <tr className="text-foreground">
      <th className="p-2 md:px-4 md:py-2">{t("name")}</th>
      <th className="p-2 md:px-4 md:py-2">{t("email")}</th>
      <th className="p-2 md:px-4 md:py-2">{t("role")}</th>
      <th className="p-2 md:px-4 md:py-2">{t("dateAdded")}</th>
      <th className="p-2 md:px-4 md:py-2">{t("verified")}</th>
      <th className="p-2 md:px-4 md:py-2">
        <span className="sr-only">{t("options")}</span>
      </th>
    </tr>
  );
}
