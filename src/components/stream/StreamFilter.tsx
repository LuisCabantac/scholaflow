import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown } from "lucide-react";

import type { StreamSort } from "@/types/stream";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const options: StreamSort[] = [
  "all",
  "stream",
  "assignment",
  "quiz",
  "material",
];

export default function StreamFilter({
  classId,
  sort,
}: {
  classId: string;
  sort: StreamSort;
}) {
  const { t } = useTranslation("stream", { keyPrefix: "filters" });

  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-start justify-start">
      <DropdownMenu onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-auto p-0 hover:bg-transparent">
            <span>{t(sort)}</span>
            <ChevronDown
              strokeWidth={3}
              className={`${open ? "rotate-180" : "rotate-0"} w-4 transition-transform`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {options.map((option) => (
            <DropdownMenuItem key={option} asChild>
              <Link
                to="/classroom/class/$classId"
                params={{ classId }}
                search={{ sort: option }}
                resetScroll={false}
                className={`${sort === option ? "font-medium" : ""} hover:bg-foreground/20 flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl p-2 text-left text-nowrap`}
              >
                <span>{t(option)}</span>
                {sort === option && (
                  <Check strokeWidth={3} className="h-4 w-4" />
                )}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
