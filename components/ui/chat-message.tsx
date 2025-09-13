"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, User, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/classnames"

interface ChatMessageProps {
  message: {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
    actions?: Array<{
      id: string
      title: string
      description: string
      priority: "high" | "medium" | "low"
      category: string
      estimatedImprovement: number
      status: "pending" | "in-progress" | "completed"
    }>
    insights?: Array<{
      type: "compliance" | "rto" | "rpo" | "cost"
      title: string
      current: number
      target: number
      improvement: number
    }>
  }
  onExecuteAction?: (actionId: string) => void
}

export function ChatMessage({ message, onExecuteAction }: ChatMessageProps) {
  const isUser = message.role === "user"

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  return (
    <div className={cn("flex gap-3 p-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src="/placeholder.svg?height=32&width=32" />
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col gap-2 max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-lg px-4 py-2 text-sm",
            isUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted text-muted-foreground",
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* AI Insights */}
        {message.insights && message.insights.length > 0 && (
          <Card className="w-full">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 text-sm">Recovery Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {message.insights.map((insight, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{insight.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {insight.current}% → {insight.target}%
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      +{insight.improvement}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actionable Recommendations */}
        {message.actions && message.actions.length > 0 && (
          <Card className="w-full">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 text-sm">Recommended Actions</h4>
              <div className="space-y-3">
                {message.actions.map((action) => (
                  <div key={action.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(action.status)}
                        <h5 className="font-medium text-sm">{action.title}</h5>
                        <Badge className={cn("text-xs", getPriorityColor(action.priority))}>{action.priority}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{action.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Category: {action.category}</span>
                        <span>Impact: +{action.estimatedImprovement} score</span>
                      </div>
                    </div>
                    {action.status === "pending" && onExecuteAction && (
                      <Button size="sm" variant="outline" onClick={() => onExecuteAction(action.id)} className="ml-3">
                        Execute
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <span className="text-xs text-muted-foreground">{message.timestamp.toLocaleTimeString()}</span>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
