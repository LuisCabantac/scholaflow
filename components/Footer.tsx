import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col items-center gap-4 border-t border-[#dddfe6] px-4 py-4 text-xs md:flex-row md:justify-between md:px-8">
      <p>&copy; 2024 ScholaFlow. All rights reserved.</p>
      <Link href="/privacy" className="font-medium hover:underline">
        Privacy Policy
      </Link>
    </footer>
  );
}
