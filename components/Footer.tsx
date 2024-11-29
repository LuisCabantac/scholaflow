import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex items-center justify-between border-t-2 border-[#dbe4ff] px-4 py-4 font-medium md:px-8">
      <Link href="/privacy" className="hover:underline">
        Privacy
      </Link>
      <p>&copy; 2024 ScholaFlow</p>
    </footer>
  );
}
