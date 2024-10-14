import React from "react";

export default function DashboardCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border-2 border-[#dbe4ff] px-4 py-2">
      <h4 className="pb-2 text-lg font-medium">{title}</h4>
      <div className="border-t-2 pt-2">{children}</div>
    </section>
  );
}
