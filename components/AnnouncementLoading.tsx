export default function AnnouncementLoading() {
  return (
    <ul className="grid gap-3 md:gap-4">
      <li className="grid w-full grid-cols-[1.8rem_1fr] gap-4 rounded-md border-2 border-[#dbe4ff] bg-[#f3f6ff] p-4 md:grid-cols-[3rem_1fr]">
        <div className="h-10 w-10 rounded-full bg-[#dbe4ff] md:h-12 md:w-12"></div>
        <div>
          <div className="grid gap-2">
            <div className="h-3 w-[10rem] rounded-md bg-[#dbe4ff] md:h-5 md:w-[20rem]"></div>
            <div className="h-2 w-[5rem] rounded-md bg-[#dbe4ff] md:h-4 md:w-[10rem]"></div>
          </div>
          <div className="grid gap-4 pt-3">
            <div className="h-3 w-full rounded-md bg-[#dbe4ff] md:h-5"></div>
            <div className="h-[15rem] w-full rounded-md bg-[#dbe4ff]"></div>
          </div>
        </div>
      </li>
      <li className="grid w-full grid-cols-[3rem_1fr] gap-4 rounded-md border-2 border-[#dbe4ff] bg-[#f3f6ff] p-4">
        <div className="h-10 w-10 rounded-full bg-[#dbe4ff] md:h-12 md:w-12"></div>
        <div>
          <div className="grid gap-2">
            <div className="h-3 w-[10rem] rounded-md bg-[#dbe4ff] md:h-5 md:w-[20rem]"></div>
            <div className="h-2 w-[5rem] rounded-md bg-[#dbe4ff] md:h-4 md:w-[10rem]"></div>
          </div>
          <div className="grid gap-4 pt-3">
            <div className="h-3 w-full rounded-md bg-[#dbe4ff] md:h-5"></div>
            <div className="h-[15rem] w-full rounded-md bg-[#dbe4ff]"></div>
          </div>
        </div>
      </li>
    </ul>
  );
}
