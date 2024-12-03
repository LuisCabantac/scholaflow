import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex items-center justify-between border-t border-[#dddfe6] px-4 py-4 text-xs md:px-8">
      <p>&copy; 2024 ScholaFlow</p>
      <Link href="/privacy" className="hover:underline">
        Privacy Policy
      </Link>
    </footer>
  );
}
