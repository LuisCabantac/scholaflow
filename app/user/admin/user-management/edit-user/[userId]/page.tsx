import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

export default function Page({ params }: { params: Params }) {
  const { userId } = params;

  return <div>{userId}</div>;
}
