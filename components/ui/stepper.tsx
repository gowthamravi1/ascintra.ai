"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepperProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("flex items-center", className)}>
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div className="flex items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium",
                index < currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : index === currentStep
                    ? "border-primary bg-background text-primary"
                    : "border-muted-foreground bg-background text-muted-foreground",
              )}
            >
              {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <span
              className={cn(
                "ml-2 text-sm font-medium",
                index <= currentStep ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={cn("mx-4 h-0.5 w-12 bg-muted-foreground", index < currentStep && "bg-primary")} />
          )}
        </div>
      ))}
    </div>
  )
}
