import Image from "next/image";
import * as motion from "framer-motion/client";

import heroImage from "@/public/landing_page/hero.png";

import Button from "@/components/Button";

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { straggerChildren: 0.2 } },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

export default function Hero() {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="z-10 flex flex-col items-center gap-10 md:gap-14"
    >
      <div className="flex items-center justify-center gap-4 px-3 pb-10 pt-20 text-center md:px-48 md:pb-10 md:pt-14">
        <div className="flex flex-col items-center justify-center gap-4 md:gap-8">
          <div className="grid gap-3 md:gap-6">
            <motion.h1
              variants={fadeInUp}
              className="text-4xl font-semibold tracking-tighter md:text-6xl"
            >
              Your All-in-One Learning Platform
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="px-8 text-center md:text-lg"
            >
              All your classroom tools in one place. Get organized, stay
              focused, and make learning click.
            </motion.p>
          </div>
          <motion.div variants={fadeInUp} className="flex items-center gap-2">
            <Button href="/user/classroom" type="primary">
              Get started
            </Button>
            <a
              href="#"
              className="flex h-10 items-center gap-1 rounded-md px-4 py-2 text-sm font-medium text-[#22317c] transition-colors hover:text-[#384689]"
            >
              View features
            </a>
          </motion.div>
        </div>
      </div>
      <motion.div
        variants={fadeIn}
        className="h-[90%] w-[90%] rounded-md shadow-lg md:w-[80%]"
      >
        <Image
          src={heroImage}
          width={0}
          height={0}
          placeholder="blur"
          className="rounded-md"
          alt="hero image"
        />
      </motion.div>
    </motion.section>
  );
}
