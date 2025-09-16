"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Mic, Paperclip } from "lucide-react"
import { cn } from "@/lib/classnames"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSendMessage,
  disabled,
  placeholder = "Ask Recovery Copilot about your recovery posture...",
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Voice recording logic would go here
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4 border-t bg-background">
      <div className="flex-1 relative">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[44px] max-h-32 resize-none pr-20"
          rows={1}
        />
        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={toggleRecording}
            className={cn("h-8 w-8 p-0", isRecording && "text-red-500")}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Button type="submit" disabled={!message.trim() || disabled} className="h-11 px-4">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}
