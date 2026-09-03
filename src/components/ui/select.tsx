"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/* A dropdown in the main site's design language: square corners, hairline
   border, serif face, accent-coloured check on the selected row.
 *
 * Note there are two other `select.tsx` files in this repo — under
 * app/bills/components/ui and components/tracker/ui. Both are stock shadcn on
 * Radix and are themed for those sub-apps (rounded, shadowed, and keyed to the
 * tracker's semantic tokens). They render incorrectly outside their scope:
 * `--color-accent` is Toronto blue on the main site while
 * `--color-accent-foreground` stays near-black, so a highlighted row comes out
 * dark-on-dark. Use this one anywhere on the main site.
 *
 * Built on Base UI, matching the site's other primitives (dialog, accordion,
 * collapsible). Renders a hidden input when `name` is set, so it submits
 * inside a plain <form> like a native <select>. */

export type SelectOption = {
  value: string;
  label: string;
};

export function Select({
  id,
  name,
  value,
  onValueChange,
  options,
  placeholder = "Select one",
  disabled,
  required,
  invalid,
  className,
}: {
  id?: string;
  /** Set to submit with a surrounding form, as a native <select> would. */
  name?: string;
  /** "" means nothing selected. */
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  /** Draws the error border; pair with your own message below the field. */
  invalid?: boolean;
  /** Applied to the trigger — use it to set width. */
  className?: string;
}) {
  return (
    <SelectPrimitive.Root
      items={options}
      // Base UI models "nothing selected" as null; the empty string is what
      // form state elsewhere in the app uses. Translate at the boundary.
      value={value === "" ? null : value}
      onValueChange={(next) => onValueChange((next as string | null) ?? "")}
      name={name}
      disabled={disabled}
      required={required}
    >
      <SelectPrimitive.Trigger
        id={id}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-3 border bg-white px-4 py-3.5 text-left font-serif text-[17px] text-dark transition-colors",
          "hover:border-dark focus-visible:border-dark focus-visible:outline-none data-[popup-open]:border-dark",
          "disabled:cursor-not-allowed disabled:opacity-60",
          invalid ? "border-accent" : "border-border-light",
          className,
        )}
      >
        <SelectPrimitive.Value
          placeholder={placeholder}
          className="truncate data-[placeholder]:text-text-muted"
        />
        {/* Rotation keys off the trigger's `data-popup-open` rather than the
            icon's own state: Base UI maps the icon through the collapsible
            mapping, so it emits `data-panel-open` here, which is an internal
            quirk not worth depending on. */}
        <SelectPrimitive.Icon className="shrink-0 text-text-secondary transition-transform duration-200 [[data-popup-open]_&]:rotate-180">
          <ChevronDown className="size-4" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          sideOffset={4}
          // Anchor below the trigger rather than overlaying the selected item
          // on top of it — with 25 wards the native-style overlay jumps around.
          alignItemWithTrigger={false}
          className="z-50"
        >
          <SelectPrimitive.Popup
            className={cn(
              "max-h-[min(20rem,var(--available-height))] w-[var(--anchor-width)] overflow-y-auto border border-dark bg-white py-1",
              "origin-[var(--transform-origin)] transition-[transform,opacity] duration-150",
              "data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0",
              "data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0",
            )}
          >
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 font-serif text-[17px] text-dark outline-none",
                  "data-[highlighted]:bg-linen-200 data-[selected]:font-medium",
                )}
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="shrink-0 text-accent">
                  <Check className="size-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
