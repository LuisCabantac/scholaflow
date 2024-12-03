export default function HowItWorks() {
  return (
    <section className="mx-6 mb-12 mt-20 grid items-center justify-center gap-16 md:mx-10 md:mt-24 md:gap-24">
      <h2 className="text-center text-[#616572]">How it works</h2>
      <div className="grid items-start gap-8 md:grid-cols-3 md:gap-12">
        <div className="w-full">
          <div className="flex items-start justify-start gap-4">
            <div className="mt-2 shrink-0 rounded-md bg-[#c7d2f1] p-2 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5 stroke-[#384689]"
              >
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="m9 14 2 2 4-4" />
              </svg>
            </div>
            <div className="grid gap-2 text-pretty">
              <h4 className="text-lg font-medium leading-tight">
                Create and assign
              </h4>
              <p className="text-sm">
                Easily create assignments, share resources, and set deadlines.
                Quickly set up assignments, attach materials like documents or
                links, and schedule deadlines to keep your class organized.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-start justify-start gap-4">
            <div className="mt-2 shrink-0 rounded-md bg-[#c7d2f1] p-2 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5 stroke-[#384689]"
              >
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              </svg>
            </div>
            <div className="grid gap-2 text-pretty">
              <h4 className="text-lg font-medium leading-tight">
                Collaborate and communicate
              </h4>
              <p className="text-sm">
                Connect with students through chat or comments for questions and
                discussions. Use chat and comments to answer questions, share
                updates, and encourage group discussions.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-start justify-start gap-4">
            <div className="mt-2 shrink-0 rounded-md bg-[#c7d2f1] p-2 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5 stroke-[#384689]"
              >
                <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
                <circle cx="12" cy="8" r="6" />
              </svg>
            </div>
            <div className="grid gap-2 text-pretty">
              <h4 className="text-lg font-medium leading-tight">
                Grade and feedback
              </h4>
              <p className="text-sm">
                Provide timely and helpful feedback while managing classwork
                grading. Review and grade assignments, leave comments, and help
                students stay on top of their progress.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
