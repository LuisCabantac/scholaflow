import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation("common");

  return (
    <footer className="text-foreground/70 flex flex-col items-center gap-4 border-t px-4 py-6 text-xs md:flex-row md:justify-between md:px-10 md:py-8 lg:px-14">
      <p className="font-medium">
        {t("footer.copyright", { year: new Date().getFullYear() })}
      </p>
      <div className="flex items-center gap-4">
        <Link to="/terms" className="hover:underline">
          {t("footer.terms")}
        </Link>
        <Link to="/privacy" className="hover:underline">
          {t("footer.privacy")}
        </Link>
      </div>
    </footer>
  );
}
