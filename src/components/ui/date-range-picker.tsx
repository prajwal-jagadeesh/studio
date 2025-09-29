
"use client"

import * as React from "react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps extends React.ComponentProps<"div"> {
    range: DateRange | undefined;
    onRangeChange: (range: DateRange | undefined) => void;
    align?: "start" | "center" | "end";
    trigger?: React.ReactNode;
}

export function DateRangePicker({
  className,
  range,
  onRangeChange,
  align = "center",
  trigger
}: DateRangePickerProps) {

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
            {trigger ? trigger : (
                <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !range && "text-muted-foreground"
                    )}
                >
                    {range?.from ? (
                    range.to ? (
                        <>
                        {format(range.from, "LLL dd, y")} -{" "}
                        {format(range.to, "LLL dd, y")}
                        </>
                    ) : (
                        format(range.from, "LLL dd, y")
                    )
                    ) : (
                    <span>Pick a date</span>
                    )}
                </Button>
            )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={onRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
