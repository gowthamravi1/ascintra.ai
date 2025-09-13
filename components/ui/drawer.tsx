"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const DrawerContext = React.createContext<{
  open?: boolean
  onOpenChange?: (open: boolean) => void
}>({})

const Drawer = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)

  return <DrawerContext.Provider value={{ open, onOpenChange: setOpen }}>{children}</DrawerContext.Provider>
}

const DrawerTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { onOpenChange } = React.useContext(DrawerContext)

    return (
      <button ref={ref} className={className} onClick={() => onOpenChange?.(true)} {...props}>
        {children}
      </button>
    )
  },
)
DrawerTrigger.displayName = "DrawerTrigger"

const DrawerContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(DrawerContext)

    if (!open) return null

    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />

        {/* Drawer */}
        <div
          ref={ref}
          className={cn(
            "fixed inset-y-0 right-0 z-50 h-full w-3/4 border-l bg-background p-6 shadow-lg transition ease-in-out sm:max-w-sm",
            className,
          )}
          {...props}
        >
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={() => onOpenChange?.(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          {children}
        </div>
      </div>
    )
  },
)
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
  ),
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  ),
)
DrawerTitle.displayName = "DrawerTitle"

const DrawerDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
)
DrawerDescription.displayName = "DrawerDescription"

const DrawerFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6", className)}
      {...props}
    />
  ),
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { onOpenChange } = React.useContext(DrawerContext)

    return (
      <button ref={ref} className={className} onClick={() => onOpenChange?.(false)} {...props}>
        {children}
      </button>
    )
  },
)
DrawerClose.displayName = "DrawerClose"

export { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose }
