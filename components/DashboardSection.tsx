"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import DashboardCard from "@/components/DashboardCard";

export default function DashboardSection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toastMessage = searchParams.get("toast");
  const hasShownToast = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && toastMessage && !hasShownToast.current) {
      toast.success(decodeURIComponent(toastMessage));
      hasShownToast.current = true;

      const params = new URLSearchParams(searchParams);
      params.delete("toast");
      router.replace(`/user/dashboard?${params.toString()}`);
    }
  }, [isHydrated, toastMessage, searchParams, router]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <DashboardCard title="Announcements">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus dicta
          vero debitis, molestiae fuga laudantium optio perferendis temporibus,
          soluta facilis pariatur sapiente animi itaque quia! Aliquam quidem
          magnam reprehenderit ullam?
        </p>
      </DashboardCard>
      <DashboardCard title="Announcements">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus dicta
          vero debitis, molestiae fuga laudantium optio perferendis temporibus,
          soluta facilis pariatur sapiente animi itaque quia! Aliquam quidem
          magnam reprehenderit ullam?
        </p>
      </DashboardCard>
      <DashboardCard title="Announcements">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus dicta
          vero debitis, molestiae fuga laudantium optio perferendis temporibus,
          soluta facilis pariatur sapiente animi itaque quia! Aliquam quidem
          magnam reprehenderit ullam?
        </p>
      </DashboardCard>
      <DashboardCard title="Announcements">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus dicta
          vero debitis, molestiae fuga laudantium optio perferendis temporibus,
          soluta facilis pariatur sapiente animi itaque quia! Aliquam quidem
          magnam reprehenderit ullam?
        </p>
      </DashboardCard>
    </div>
  );
}
