

## Fix: Separate Date and Time Inputs in ReminderConfirmDialog

### Problem
The `datetime-local` input (line 69-74) couples date and time together. When the user changes the date, it can reset or affect the time value. The user wants independent date and time controls.

### Solution
Replace the single `<Input type="datetime-local">` with two separate inputs:
1. **Date picker** — using a Shadcn `Calendar` inside a `Popover` (as per the datepicker pattern)
2. **Time input** — a simple `<Input type="time">` for hours/minutes

When either changes, reconstruct the full ISO timestamp by combining the date part from the calendar and the time part from the time input, preserving the other value.

### Files to modify
- **`src/components/ReminderConfirmDialog.tsx`**
  - Import `Calendar`, `Popover`, `PopoverTrigger`, `PopoverContent`, `format` from date-fns, `CalendarIcon`
  - Replace the `datetime-local` input (lines 66-76) with:
    - A date popover using `Calendar` (with `pointer-events-auto`)
    - A separate `<Input type="time">` field
  - Parse existing `trigger_time` into separate date and time parts
  - On date change: keep existing time, update date
  - On time change: keep existing date, update time
  - Reconstruct ISO string from both parts on each change

