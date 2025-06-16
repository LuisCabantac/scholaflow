import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col items-center gap-4 border-t px-4 py-4 text-xs text-foreground/70 md:flex-row md:justify-between md:px-10 lg:px-14">
      <p className="font-medium">
        &copy; {new Date().getFullYear()} ScholaFlow. All rights reserved.
      </p>
      <div className="flex items-center gap-4">
        <Link href="/terms-of-use" target="_blank" className="hover:underline">
          Terms and Conditions
        </Link>
        <Link href="/privacy" target="_blank" className="hover:underline">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
