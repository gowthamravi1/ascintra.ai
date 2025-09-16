"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChatMessage } from "@/components/ui/chat-message"
import { ChatInput } from "@/components/ui/chat-input"
import { QuickActions } from "@/components/ui/quick-actions"
import { Bot, Settings, Download, RefreshCw, Brain, Shield, Clock, TrendingUp } from "lucide-react"

interface Message {
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

export default function RecoveryCopilotChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hello! I'm your Recovery Copilot, an AI assistant specialized in improving your recovery posture and compliance scores.

I can help you with:
• Analyzing your current recovery posture across all AWS services
• Identifying compliance gaps in ISO 27031, DORA, SOC 2, and NIST frameworks
• Optimizing RTO/RPO performance for critical workloads
• Providing actionable recommendations with estimated impact scores
• Tracking progress toward compliance targets

What would you like to focus on today?`,
      timestamp: new Date(),
      insights: [
        {
          type: "compliance",
          title: "Overall Recovery Score",
          current: 74,
          target: 90,
          improvement: 16,
        },
        {
          type: "rto",
          title: "Average RTO Performance",
          current: 85,
          target: 95,
          improvement: 10,
        },
        {
          type: "rpo",
          title: "RPO Compliance Rate",
          current: 78,
          target: 92,
          improvement: 14,
        },
        {
          type: "cost",
          title: "Recovery Cost Efficiency",
          current: 68,
          target: 85,
          improvement: 17,
        },
      ],
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(content)
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const handleQuickAction = (actionId: string) => {
    const actionMessages: Record<string, string> = {
      "analyze-posture": "Please analyze my current recovery posture and provide a comprehensive assessment.",
      "compliance-gaps": "Identify compliance gaps in my current setup for ISO 27031, DORA, and SOC 2.",
      "optimize-rto": "How can I optimize my RTO performance for critical workloads?",
      "optimize-rpo": "What are the best strategies to improve my RPO targets?",
      "trend-analysis": "Show me recovery performance trends over the last 6 months.",
      "critical-issues": "What are the most critical recovery issues I need to address?",
      "test-validation": "Help me validate my recent recovery test results.",
      "quick-wins": "Give me quick wins to improve my recovery score immediately.",
    }

    const message = actionMessages[actionId]
    if (message) {
      handleSendMessage(message)
    }
  }

  const handleExecuteAction = (actionId: string) => {
    // Update action status to in-progress
    setMessages((prev) =>
      prev.map((msg) => ({
        ...msg,
        actions: msg.actions?.map((action) =>
          action.id === actionId ? { ...action, status: "in-progress" as const } : action,
        ),
      })),
    )

    // Simulate action execution
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          actions: msg.actions?.map((action) =>
            action.id === actionId ? { ...action, status: "completed" as const } : action,
          ),
        })),
      )
    }, 3000)
  }

  const generateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("analyze") || lowerMessage.includes("posture")) {
      return {
        id: Date.now().toString(),
        role: "assistant",
        content: `I've analyzed your current recovery posture across all AWS services. Here's what I found:

**Current State:**
• Overall Recovery Score: 74/100 (Good, but room for improvement)
• 23 AWS services monitored across 3 regions
• 156 critical resources with varying recovery readiness
• Average RTO: 4.2 hours (Target: 2 hours)
• Average RPO: 45 minutes (Target: 15 minutes)

**Key Findings:**
• EC2 instances in us-east-1 lack cross-region backup replication
• RDS databases missing automated failover configuration
• S3 buckets need versioning and cross-region replication
• Lambda functions require dead letter queue configuration

I've prepared specific actions to address these issues. Would you like me to prioritize them by business impact?`,
        timestamp: new Date(),
        actions: [
          {
            id: "cross-region-backup",
            title: "Enable Cross-Region Backup Replication",
            description: "Configure automated backup replication for EC2 and RDS across regions",
            priority: "high",
            category: "Data Protection",
            estimatedImprovement: 12,
            status: "pending",
          },
          {
            id: "rds-failover",
            title: "Configure RDS Multi-AZ Failover",
            description: "Enable automatic failover for production RDS instances",
            priority: "high",
            category: "High Availability",
            estimatedImprovement: 15,
            status: "pending",
          },
          {
            id: "s3-versioning",
            title: "Enable S3 Versioning and CRR",
            description: "Configure versioning and cross-region replication for critical S3 buckets",
            priority: "medium",
            category: "Data Protection",
            estimatedImprovement: 8,
            status: "pending",
          },
        ],
        insights: [
          {
            type: "compliance",
            title: "ISO 27031 Compliance",
            current: 78,
            target: 95,
            improvement: 17,
          },
          {
            type: "rto",
            title: "RTO Performance",
            current: 65,
            target: 90,
            improvement: 25,
          },
        ],
      }
    }

    if (lowerMessage.includes("compliance") || lowerMessage.includes("gap")) {
      return {
        id: Date.now().toString(),
        role: "assistant",
        content: `I've identified several compliance gaps across your recovery frameworks:

**ISO 27031 (Business Continuity) - 78% Compliant**
• Missing: Documented recovery procedures for 12 critical services
• Gap: Regular recovery testing schedule not established
• Issue: Business impact analysis needs updating

**DORA (Digital Operational Resilience) - 65% Compliant**
• Missing: ICT risk management framework
• Gap: Third-party provider risk assessment
• Issue: Operational resilience testing insufficient

**SOC 2 Type II - 85% Compliant**
• Missing: Automated monitoring for availability controls
• Gap: Incident response documentation incomplete

**NIST Cybersecurity Framework - 72% Compliant**
• Missing: Recovery communication procedures
• Gap: Supply chain risk management

I recommend starting with the high-impact, low-effort improvements first.`,
        timestamp: new Date(),
        actions: [
          {
            id: "document-procedures",
            title: "Document Recovery Procedures",
            description: "Create standardized recovery procedures for all critical services",
            priority: "high",
            category: "Documentation",
            estimatedImprovement: 18,
            status: "pending",
          },
          {
            id: "testing-schedule",
            title: "Establish Recovery Testing Schedule",
            description: "Implement automated monthly recovery testing for critical workloads",
            priority: "high",
            category: "Testing",
            estimatedImprovement: 22,
            status: "pending",
          },
          {
            id: "monitoring-automation",
            title: "Automate Availability Monitoring",
            description: "Deploy automated monitoring for SOC 2 availability controls",
            priority: "medium",
            category: "Monitoring",
            estimatedImprovement: 12,
            status: "pending",
          },
        ],
      }
    }

    // Default response
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `I understand you're looking for help with "${userMessage}". 

As your Recovery Copilot, I can assist with:

• **Recovery Posture Analysis** - Comprehensive assessment of your current state
• **Compliance Gap Identification** - ISO 27031, DORA, SOC 2, NIST framework analysis
• **RTO/RPO Optimization** - Performance tuning for recovery objectives
• **Actionable Recommendations** - Prioritized improvements with impact estimates
• **Progress Tracking** - Monitor improvements toward compliance targets

Could you be more specific about what aspect of recovery management you'd like to focus on? I can provide detailed analysis and step-by-step remediation plans.`,
      timestamp: new Date(),
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Recovery Copilot</h1>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Brain className="h-3 w-3 mr-1" />
            AI Agent Active
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Chat
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            New Session
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-4 px-4 py-2 bg-muted/50 border-b text-sm">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-500" />
          <span>Recovery Score: 74/100</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-yellow-500" />
          <span>Avg RTO: 4.2h</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          <span>Compliance: 75%</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} onExecuteAction={handleExecuteAction} />
            ))}
            {isLoading && (
              <div className="flex justify-start p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bot className="h-4 w-4 animate-pulse" />
                  <span className="text-sm">Recovery Copilot is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            placeholder="Ask about recovery posture, compliance gaps, RTO/RPO optimization..."
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l bg-muted/20 p-4 overflow-y-auto">
          <QuickActions onActionClick={handleQuickAction} />
        </div>
      </div>
    </div>
  )
}
