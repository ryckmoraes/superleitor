
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // Add state for currently viewed month/year
  const [month, setMonth] = React.useState<Date>(props.defaultMonth || new Date())
  
  // Create array of months for the select
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", 
    "Maio", "Junho", "Julho", "Agosto", 
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ]
  
  // Create array of years (from 10 years ago to 10 years from now)
  const currentYear = new Date().getFullYear()
  const years = Array.from(
    { length: 100 },
    (_, i) => currentYear - 80 + i
  )
  
  // Handle month change from select
  const handleMonthChange = (value: string) => {
    const newMonth = new Date(month)
    newMonth.setMonth(parseInt(value))
    setMonth(newMonth)
  }
  
  // Handle year change from select
  const handleYearChange = (value: string) => {
    const newMonth = new Date(month)
    newMonth.setFullYear(parseInt(value))
    setMonth(newMonth)
  }

  return (
    <div className="space-y-4">
      {/* Custom month/year selector row */}
      <div className="flex justify-between items-center gap-2 px-1">
        <Select
          value={month.getMonth().toString()}
          onValueChange={handleMonthChange}
        >
          <SelectTrigger className="w-[140px] bg-primary/10 border-primary/20 font-medium text-primary-foreground dark:text-primary">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {months.map((month, index) => (
              <SelectItem 
                key={month} 
                value={index.toString()}
                className="cursor-pointer hover:bg-primary/10"
              >
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={month.getFullYear().toString()}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="w-[100px] bg-primary/10 border-primary/20 font-medium text-primary-foreground dark:text-primary">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {years.map((year) => (
              <SelectItem 
                key={year} 
                value={year.toString()}
                className="cursor-pointer hover:bg-primary/10"
              >
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3 pointer-events-auto rounded-xl bg-card border border-primary/20 shadow-lg", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "hidden", // Hide the default month/year label
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-8 w-8 bg-primary/10 p-0 text-primary-foreground hover:bg-primary/20 border-primary/20 rounded-full"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-primary rounded-md w-9 font-semibold text-[0.8rem] uppercase",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-medium text-sm hover:bg-primary/15 hover:text-primary focus:bg-primary/20 rounded-full transition-all"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full transition-all transform hover:scale-110",
          day_today: "bg-accent text-accent-foreground border-2 border-primary/50 font-bold",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5 text-primary" />,
          IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5 text-primary" />,
        }}
        month={month}
        onMonthChange={setMonth}
        {...props}
      />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
