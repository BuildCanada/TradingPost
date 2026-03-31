"use client"

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("not-last:border-b", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon data-slot="accordion-trigger-icon" className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden" />
        <ChevronUpIcon data-slot="accordion-trigger-icon" className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  panelClassName,
  children,
  ...props
}: AccordionPrimitive.Panel.Props & { panelClassName?: string }) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn(
        "overflow-hidden text-sm",
        panelClassName ?? "data-open:animate-accordion-down data-closed:animate-accordion-up"
      )}
      {...props}
    >
      <div
        className={cn(
          "pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

function AccordionIconCircle({ icon, isOpen }: { icon: string; isOpen: boolean }) {
  return (
    <div
      className={`w-[36px] h-[36px] mt-1 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
        isOpen
          ? "bg-accent border-accent text-bg"
          : "bg-bg border-border-light text-text-secondary hover:border-accent hover:text-accent"
      }`}
    >
      <div
        className="w-[16px] h-[16px]"
        style={{
          backgroundColor: "currentColor",
          maskImage: `url(${icon})`,
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskImage: `url(${icon})`,
          WebkitMaskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
        }}
      />
    </div>
  )
}

function AccordionChevron({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      className={`story-chevron transition-transform duration-200 ${
        isOpen ? "text-accent" : "text-text-secondary"
      }`}
    >
      &#x25BE;
    </span>
  )
}

function AccordionBulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mt-3">
      {items.map((text, i) => (
        <li key={i} className="type-body text-dark flex items-start gap-2">
          <span className="mt-[clamp(0.75rem,0.75rem+0.25vw,1rem)] w-[5px] h-[5px] rounded-full shrink-0 bg-accent" />
          {text}
        </li>
      ))}
    </ul>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent, AccordionIconCircle, AccordionChevron, AccordionBulletList }
