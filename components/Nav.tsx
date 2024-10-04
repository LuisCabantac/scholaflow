import { FontType } from "@/app/layout";
import Button from "@/components/Button";
import Logo from "@/components/Logo";

export default function Nav({ font }: { font: FontType }) {
  return (
    <div className="flex items-center justify-between px-5 py-5 md:px-10 md:py-5">
      <Logo font={font} />
      <div className="flex items-center gap-4">
        <Button>Sign in</Button>
      </div>
    </div>
  );
}
