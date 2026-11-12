import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

export default function CtaSection() {
  const { t } = useTranslation("landing", { keyPrefix: "cta" });

  return (
    <motion.section
      className="py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="text-center">
          <h2 className="text-foreground text-4xl font-medium text-balance md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-foreground/70 mt-4">{t("description")}</p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button asChild>
              <Link to="/classroom">{t("button")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
