import { useTranslation } from "react-i18next";

export default function MockAvatar({
  file,
  name,
}: {
  file: string;
  name: string;
}) {
  const { t } = useTranslation("landing", { keyPrefix: "mocks" });

  return (
    <img
      src={`/landing_page/${file}`}
      width={24}
      height={24}
      className="h-6 w-6 shrink-0 rounded-full select-none"
      alt={t("avatarAlt", { name })}
    />
  );
}
