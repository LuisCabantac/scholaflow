import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "stroke-primary/90 size-5",
} as const;

const steps: {
  key: "create" | "collaborate" | "grade";
  delay: number;
  icon: ReactNode;
}[] = [
  {
    key: "create",
    delay: 0.4,
    icon: (
      <svg aria-hidden="true" {...iconProps}>
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="m9 14 2 2 4-4" />
      </svg>
    ),
  },
  {
    key: "collaborate",
    delay: 0.5,
    icon: (
      <svg aria-hidden="true" {...iconProps}>
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
    ),
  },
  {
    key: "grade",
    delay: 0.6,
    icon: (
      <svg aria-hidden="true" {...iconProps}>
        <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
        <circle cx="12" cy="8" r="6" />
      </svg>
    ),
  },
];

export default function StepsSection() {
  const { t } = useTranslation("landing", { keyPrefix: "steps" });

  return (
    <section className="mx-6 mt-20 mb-4 grid items-center justify-center gap-16 md:mx-10 md:mt-24 md:mb-12 md:gap-14 lg:mx-20">
      <div className="relative mx-auto max-w-xl space-y-6 text-center">
        <motion.h2
          className="text-foreground text-3xl font-medium text-balance lg:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {t("title")}
        </motion.h2>
        <motion.p
          className="text-foreground/70"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {t("description")}
        </motion.p>
      </div>
      <div className="bg-card grid items-start gap-12 rounded-2xl border p-6 md:mx-14 md:max-w-6xl md:grid-cols-3 md:p-12">
        {steps.map((step) => (
          <motion.div
            key={step.key}
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: step.delay }}
          >
            <div className="flex items-start justify-start gap-4">
              <div className="bg-foreground/10 mt-2 shrink-0 rounded-xl p-2 shadow-sm">
                {step.icon}
              </div>
              <div className="grid gap-2 text-pretty">
                <h4 className="text-foreground text-lg leading-tight font-medium">
                  {t(`items.${step.key}.title`)}
                </h4>
                <p className="text-foreground/70 text-sm">
                  {t(`items.${step.key}.description`)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
