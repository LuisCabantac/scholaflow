export default function CommentsLoading() {
  return (
    <li className="flex gap-2" role="status">
      <span className="sr-only">Loading…</span>
      <div className="h-8 w-8 animate-pulse rounded-full bg-[#e0e7ff]"></div>
      <div className="grid gap-2">
        <div className="h-[0.875rem] w-20 animate-pulse rounded-md bg-[#e0e7ff]"></div>
        <div className="h-[0.875rem] w-28 animate-pulse rounded-md bg-[#e0e7ff]"></div>
      </div>
    </li>
  );
}
