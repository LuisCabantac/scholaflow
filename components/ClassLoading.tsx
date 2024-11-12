export default function ClassLoading() {
  return (
    <ul className="contents">
      <li className="relative flex h-[8rem] w-full flex-col gap-2 rounded-md border-2 border-[#dbe4ff] bg-[#f3f6ff] p-4 shadow-sm md:h-[10rem]">
        <div className="absolute left-3 top-3 grid w-[90%] gap-2 md:left-4 md:top-4">
          <div className="h-4 w-full animate-pulse rounded-md bg-[#dbe4ff] md:h-5"></div>
          <div className="h-3 w-10 animate-pulse rounded-md bg-[#dbe4ff] md:h-4 md:w-12"></div>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="h-6 w-6 animate-pulse rounded-full bg-[#dbe4ff] md:bottom-4 md:left-4 md:h-8 md:w-8"></div>
          <div className="grid gap-2">
            <div className="h-2 w-20 animate-pulse rounded-md bg-[#dbe4ff] md:bottom-4 md:left-4 md:h-3"></div>
            <div className="h-2 w-10 animate-pulse rounded-md bg-[#dbe4ff] md:bottom-4 md:left-4 md:h-3"></div>
          </div>
        </div>
      </li>
    </ul>
  );
}
