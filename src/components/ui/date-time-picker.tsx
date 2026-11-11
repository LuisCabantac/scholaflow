import { ChevronDownIcon } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

import { formatTimeFromDate } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DateTimePicker({
  date,
  disabled,
  onSetDate,
  showLabels = true,
  datePickerIsOpen,
  onSetDatePickerIsOpen,
}: {
  date: Date | undefined;
  disabled: boolean;
  showLabels: boolean;
  datePickerIsOpen?: boolean;
  onSetDatePickerIsOpen: Dispatch<SetStateAction<boolean>>;
  onSetDate: Dispatch<SetStateAction<Date | undefined>>;
}) {
  const { t } = useTranslation("common", { keyPrefix: "dateTime" });

  const isSelectedToday =
    date !== undefined &&
    new Date(date.toDateString()).getTime() ===
      new Date(new Date().toDateString()).getTime();

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        {showLabels && (
          <Label htmlFor="date" className="px-1">
            {t("date")}
          </Label>
        )}
        <Popover
          open={datePickerIsOpen}
          onOpenChange={onSetDatePickerIsOpen}
          modal={false}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date"
              className="bg-foreground/10 w-32 justify-between rounded-xl font-normal"
              disabled={disabled}
            >
              {date ? date.toLocaleDateString() : t("selectDate")}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="z-[1100] w-auto overflow-hidden rounded-xl p-0"
            align="start"
            style={{ position: "fixed" }}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              disabled={{ before: new Date() }}
              onSelect={(selected) => {
                onSetDate(selected);
                onSetDatePickerIsOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        {showLabels && (
          <Label htmlFor="time" className="px-1">
            {t("time")}
          </Label>
        )}
        <Input
          type="time"
          id="time"
          step="1"
          defaultValue={formatTimeFromDate(date)}
          className="bg-foreground/10 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          min={
            isSelectedToday
              ? new Date().toLocaleTimeString("en-GB", { hour12: false })
              : undefined
          }
          disabled={!date || disabled}
        />
      </div>
    </div>
  );
}
