"use client"

import { cn } from "@/lib/utils"

interface HeatCellProps {
  value: number
  maxValue?: number
  className?: string
  onClick?: () => void
}

export function HeatCell({ value, maxValue = 100, className, onClick }: HeatCellProps) {
  const intensity = Math.min(value / maxValue, 1)

  const getHeatColor = (intensity: number) => {
    if (intensity === 0) return "bg-gray-100"
    if (intensity <= 0.2) return "bg-green-200"
    if (intensity <= 0.4) return "bg-yellow-200"
    if (intensity <= 0.6) return "bg-orange-200"
    if (intensity <= 0.8) return "bg-red-200"
    return "bg-red-400"
  }

  return (
    <div
      className={cn(
        "w-4 h-4 rounded-sm cursor-pointer transition-all hover:scale-110",
        getHeatColor(intensity),
        className,
      )}
      onClick={onClick}
      title={`Value: ${value}`}
    />
  )
}
