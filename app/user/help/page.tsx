import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  if (!session) return redirect("/signin");

  return <div></div>;
}
