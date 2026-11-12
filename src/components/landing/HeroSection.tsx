import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

const HERO_SIZES =
  "(min-width: 1024px) min(100vw, 1280px), (min-width: 768px) min(100vw, 1152px), 90vw";

export default function HeroSection({
  onViewFeatures,
}: {
  onViewFeatures: () => void;
}) {
  const { t } = useTranslation("landing", { keyPrefix: "hero" });

  return (
    <section className="z-10 flex flex-col items-center gap-10 md:gap-14">
      <div className="flex items-center justify-center gap-4 px-3 pt-20 pb-10 text-center md:px-48 md:pt-20 md:pb-10">
        <div className="flex flex-col items-center justify-center gap-4 md:gap-8">
          <div className="grid gap-3 md:gap-6">
            <motion.h1
              className="text-foreground text-4xl font-medium tracking-tighter md:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {t("title")}
            </motion.h1>
            <motion.p
              className="text-foreground/70 px-8 text-center md:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {t("description")}
            </motion.p>
          </div>
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button asChild>
              <Link to="/classroom">{t("getStarted")}</Link>
            </Button>
            <Button variant="outline" onClick={onViewFeatures}>
              {t("viewFeatures")}
            </Button>
          </motion.div>
        </div>
      </div>
      <motion.div
        className="flex w-full max-w-4xl items-center justify-center rounded-2xl md:max-w-6xl lg:max-w-7xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="w-[90%] md:w-full">
          <picture className="contents">
            <source
              type="image/webp"
              srcSet="/landing_page/hero-light-960.webp 960w, /landing_page/hero-light.webp 1920w"
              sizes={HERO_SIZES}
            />
            <img
              src="/landing_page/hero-light.png"
              width={1920}
              height={1080}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="block w-full rounded-2xl object-cover select-none md:shadow-2xl dark:hidden"
              alt={t("imageAlt.light")}
              onDragStart={(e) => e.preventDefault()}
            />
          </picture>
          <picture className="contents">
            <source
              type="image/webp"
              srcSet="/landing_page/hero-dark-960.webp 960w, /landing_page/hero-dark.webp 1920w"
              sizes={HERO_SIZES}
            />
            <img
              src="/landing_page/hero-dark.png"
              width={1920}
              height={1080}
              loading="lazy"
              decoding="async"
              className="hidden w-full rounded-2xl object-cover select-none md:shadow-2xl dark:block"
              alt={t("imageAlt.dark")}
              onDragStart={(e) => e.preventDefault()}
            />
          </picture>
        </div>
      </motion.div>
    </section>
  );
}
