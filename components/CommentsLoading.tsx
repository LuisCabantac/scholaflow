export default function CommentsLoading() {
  return (
    <li className="flex gap-2">
      <div className="h-8 w-8 animate-pulse rounded-full bg-[#dbe4ff]"></div>
      <div className="grid gap-2">
        <div className="flex gap-1">
          <div className="h-[0.875rem] w-20 animate-pulse rounded-md bg-[#dbe4ff]"></div>
          <div className="h-[0.75rem] w-12 animate-pulse rounded-md bg-[#dbe4ff]"></div>
        </div>
        <div className="h-[0.875rem] w-28 animate-pulse rounded-md bg-[#dbe4ff]"></div>
      </div>
    </li>
  );
}
