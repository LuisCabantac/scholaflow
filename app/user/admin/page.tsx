import { auth, ISession } from "@/lib/auth";

export default async function Page() {
  const session = await auth();

  if (
    (session as ISession).user.role === "admin" &&
    (session as ISession).user.verified
  )
    return <div>HELLO ADMIN</div>;

  return (
    <div className="flex h-[20rem] items-center justify-center text-xl font-bold">
      You are not authorized to view this page!
    </div>
  );
}
