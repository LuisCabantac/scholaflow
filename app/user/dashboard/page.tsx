import { redirect } from "next/navigation";

import DashboardCard from "@/components/DashboardCard";
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  if (!session) return redirect("/signin");

  return (
    <div className="grid grid-cols-2 gap-4">
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
