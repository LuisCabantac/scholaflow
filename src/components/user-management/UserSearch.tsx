import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";

export default function UserSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation("userManagement");

  return (
    <label
      htmlFor="user-search"
      className="group bg-foreground/10 focus-within:border-ring flex w-[60%] items-center gap-2 rounded-full border text-sm md:w-[50%]"
    >
      <Search className="stroke-muted-foreground mb-0.5 ml-3 h-5 w-5 md:h-4 md:w-4" />
      <Input
        id="user-search"
        type="search"
        placeholder={t("search")}
        className="mb-0.5 border-0 bg-transparent pl-0 shadow-none drop-shadow-none focus-visible:ring-0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
