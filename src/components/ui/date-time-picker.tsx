"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatTimeFromDate } from "@/lib/utils";

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
  onSetDatePickerIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSetDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        {showLabels && (
          <Label htmlFor="date" className="px-1">
            Date
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
              className="w-32 justify-between rounded-xl bg-foreground/10 font-normal"
              disabled={disabled}
            >
              {date ? date.toLocaleDateString() : "Select date"}
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
              onSelect={(date) => {
                onSetDate(date);
                onSetDatePickerIsOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        {showLabels && (
          <Label htmlFor="time" className="px-1">
            Time
          </Label>
        )}
        <Input
          type="time"
          id="time"
          step="1"
          defaultValue={formatTimeFromDate(date)}
          className="appearance-none bg-foreground/10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          min={
            date &&
            new Date(date.toDateString()).getTime() ===
              new Date(new Date().toDateString()).getTime()
              ? new Date().toLocaleTimeString("en-GB", { hour12: false })
              : undefined
          }
          disabled={!date || disabled}
        />
      </div>
    </div>
  );
}
