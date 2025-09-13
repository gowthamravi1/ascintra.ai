"use client"

interface ScoreGaugeProps {
  value?: number
  score?: number
  size?: number
  strokeWidth?: number
  className?: string
  label?: string
  showPercentage?: boolean
}

export function ScoreGauge({
  value,
  score,
  size = 120,
  strokeWidth = 8,
  className = "",
  label,
  showPercentage = true,
}: ScoreGaugeProps) {
  // Use value or score, with fallback to 0
  const normalizedScore = Math.max(0, Math.min(100, Number(value || score || 0)))

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference

  // Determine color based on score
  const getColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    if (score >= 40) return "text-orange-500"
    return "text-red-500"
  }

  const getStrokeColor = (score: number) => {
    if (score >= 80) return "stroke-green-500"
    if (score >= 60) return "stroke-yellow-500"
    if (score >= 40) return "stroke-orange-500"
    return "stroke-red-500"
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-500 ease-in-out ${getStrokeColor(normalizedScore)}`}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${getColor(normalizedScore)}`}>
            {Math.round(normalizedScore)}
            {showPercentage && "%"}
          </span>
          {label && <span className="text-xs text-gray-500 text-center mt-1">{label}</span>}
        </div>
      </div>
    </div>
  )
}
