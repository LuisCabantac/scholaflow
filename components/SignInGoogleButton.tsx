import { signInGoogleAction } from "@/lib/auth-actions";

export default function SignInGoogleButton() {
  return (
    <form action={signInGoogleAction}>
      <button className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-[#ced8f7] px-[1.12rem] py-[0.65rem] text-sm font-semibold text-[#22317c] transition-colors hover:border-[#c2cef1] hover:bg-[#ced8f7]">
        <svg viewBox="0 0 24 24" className="size-5 fill-[#22317c]">
          <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 01-5.279-5.28 5.27 5.27 0 015.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 00-8.934 8.934 8.907 8.907 0 008.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" />
        </svg>
        <span>Sign in with Google</span>
      </button>
    </form>
  );
}