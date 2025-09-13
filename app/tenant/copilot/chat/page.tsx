"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Zap, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScoreGauge } from "@/components/ui/score-gauge"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  actions?: Array<{ label: string; action: string }>
}

const quickSuggestions = [
  "How can I improve my recovery score?",
  "What are my biggest backup gaps?",
  "Optimize my RTO for critical systems",
  "Show compliance framework status",
  "Identify high-risk resources",
]

const mockResponses: Record<string, string> = {
  "recovery score":
    "Your current recovery score is 87%, which is good but has room for improvement. The main factors affecting your score are: 1) 3 RDS instances without automated backups (-5 points), 2) EC2 instances in single AZ (-3 points), and 3) Missing disaster recovery testing (-2 points). I recommend starting with the RDS backups as they pose the highest risk.",
  "backup gaps":
    "I've identified several backup gaps in your infrastructure: 1) **Critical**: 3 RDS instances (prod-db-1, analytics-db, user-db) lack automated backups, 2) **Medium**: 12 EBS volumes without snapshots, 3) **Low**: S3 buckets missing cross-region replication. The RDS instances should be your top priority as they contain critical business data.",
  rto: "To optimize your RTO for critical systems, I recommend: 1) **Multi-AZ deployment** for RDS instances (reduces RTO from 4h to 30min), 2) **Auto Scaling Groups** with pre-warmed instances, 3) **Application Load Balancer** health checks for faster failover, 4) **Database read replicas** in different AZs. These changes could reduce your average RTO from 2.4h to 45 minutes.",
  compliance:
    "Here's your compliance framework status: **ISO 27031**: 85% (Good) - Missing disaster recovery documentation, **DORA**: 72% (Needs Improvement) - Requires automated testing, **SOC 2**: 91% (Excellent) - Well implemented, **NIST**: 78% (Good) - Need incident response procedures. Focus on DORA compliance first as it has the biggest impact on operational resilience.",
  "high-risk":
    "I've identified these high-risk resources: 1) **Critical Risk**: prod-db-1 (no backups, single AZ), 2) **High Risk**: payment-service EC2 (no auto-scaling, single instance), 3) **Medium Risk**: user-uploads S3 bucket (no versioning). The prod-db-1 database poses the highest business risk and should be addressed immediately.",
  default:
    "I'm your Recovery Copilot, here to help optimize your disaster recovery posture. I can analyze your infrastructure, identify risks, recommend improvements, and help you achieve compliance with frameworks like ISO 27031, DORA, SOC 2, and NIST. What would you like to know about your recovery strategy?",
}

export default function RecoveryCopilotChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hello! I'm your Recovery Copilot. I can help you optimize your disaster recovery posture, identify risks, and improve compliance. What would you like to know?",
      timestamp: new Date(),
      actions: [
        { label: "Analyze Recovery Score", action: "analyze_score" },
        { label: "Find Backup Gaps", action: "find_gaps" },
        { label: "Optimize RTO/RPO", action: "optimize_rto" },
      ],
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("score") || lowerInput.includes("recovery")) {
      return mockResponses["recovery score"]
    } else if (lowerInput.includes("backup") || lowerInput.includes("gap")) {
      return mockResponses["backup gaps"]
    } else if (lowerInput.includes("rto") || lowerInput.includes("optimize")) {
      return mockResponses["rto"]
    } else if (lowerInput.includes("compliance") || lowerInput.includes("framework")) {
      return mockResponses["compliance"]
    } else if (lowerInput.includes("risk") || lowerInput.includes("critical")) {
      return mockResponses["high-risk"]
    } else {
      return mockResponses["default"]
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateResponse(content)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
        timestamp: new Date(),
        actions: [
          { label: "Get Details", action: "get_details" },
          { label: "Take Action", action: "take_action" },
        ],
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickSuggestion = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const handleActionClick = (action: string) => {
    handleSendMessage(`Execute action: ${action}`)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 animate-in">
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col glass dark:glass-dark rounded-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="glass-elevated dark:glass-elevated-dark p-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-text dark:text-text-dark">Recovery Copilot</h2>
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                AI-powered recovery optimization
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"} slide-in`}
            >
              {message.type === "assistant" && (
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}

              <div className={`max-w-[80%] ${message.type === "user" ? "order-first" : ""}`}>
                <div
                  className={`p-4 rounded-2xl ${
                    message.type === "user"
                      ? "bg-primary text-white ml-auto"
                      : "glass-elevated dark:glass-elevated-dark"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.actions && (
                  <div className="flex gap-2 mt-2">
                    {message.actions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleActionClick(action.action)}
                        className="apple-button text-xs"
                      >
                        <Zap className="mr-1 h-3 w-3" />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}

                <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>

              {message.type === "user" && (
                <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start slide-in">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="glass-elevated dark:glass-elevated-dark p-4 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        <div className="p-4 border-t border-white/20">
          <div className="flex flex-wrap gap-2 mb-4">
            {quickSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickSuggestion(suggestion)}
                className="apple-button text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
              placeholder="Ask about your recovery posture..."
              className="flex-1 glass dark:glass-dark rounded-xl px-4 py-3 text-sm text-text dark:text-text-dark placeholder-text-secondary dark:placeholder-text-secondary-dark border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              className="apple-button"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar Stats */}
      <div className="w-80 space-y-4">
        <Card className="scale-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Recovery Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark">Overall Score</span>
              <div className="flex items-center gap-2">
                <ScoreGauge value={87} size={24} />
                <span className="font-semibold text-text dark:text-text-dark">87%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark">Average RTO</span>
              <span className="font-semibold text-text dark:text-text-dark">2.4h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark">Backup Coverage</span>
              <span className="font-semibold text-text dark:text-text-dark">94%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark">Critical Issues</span>
              <Badge variant="critical">3</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="scale-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Recent Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <div className="flex-1">
                <p className="text-xs text-text dark:text-text-dark">Backup configured for RDS</p>
                <p className="text-xs text-text-secondary dark:text-text-secondary-dark">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <div className="flex-1">
                <p className="text-xs text-text dark:text-text-dark">Multi-AZ deployment pending</p>
                <p className="text-xs text-text-secondary dark:text-text-secondary-dark">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-info rounded-full"></div>
              <div className="flex-1">
                <p className="text-xs text-text dark:text-text-dark">Compliance scan completed</p>
                <p className="text-xs text-text-secondary dark:text-text-secondary-dark">1 day ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="scale-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Priority Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="glass dark:glass-dark rounded-lg p-3">
              <p className="text-xs font-medium text-text dark:text-text-dark">Configure RDS Backups</p>
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">3 databases at risk</p>
              <Badge variant="critical" className="mt-2 text-xs">
                High Priority
              </Badge>
            </div>
            <div className="glass dark:glass-dark rounded-lg p-3">
              <p className="text-xs font-medium text-text dark:text-text-dark">Enable Multi-AZ</p>
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">Reduce RTO by 75%</p>
              <Badge variant="warning" className="mt-2 text-xs">
                Medium Priority
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
