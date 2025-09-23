import { useState, useEffect } from 'react'

export interface ComplianceFramework {
  id: string
  name: string
  version?: string
  description?: string
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface ComplianceRule {
  id: string
  rule_id: string
  framework_id: string
  category: string
  description: string
  resource_type: string
  field_path: string
  operator: string
  expected_value: any
  severity: string
  remediation?: string
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface ComplianceScore {
  framework_id: string
  framework_name: string
  compliance_score: number
  total_rules: number
  passed_rules: number
  failed_rules: number
  evaluation_date: string
  categories: Record<string, {
    score: number
    total: number
    passed: number
    failed: number
  }>
}

export interface ComplianceDashboard {
  frameworks: Array<{
    id: string
    name: string
    version?: string
    total_rules: number
    enabled_rules: number
    last_evaluation?: string
    average_score?: number
  }>
  recent_evaluations: Array<{
    id: string
    account_id: string
    framework_id: string
    evaluation_date: string
    total_rules: number
    passed_rules: number
    failed_rules: number
    compliance_score: number
    evaluation_data: any
    created_at: string
  }>
  overall_score: number
  critical_issues: number
  total_resources_evaluated: number
}

export function useComplianceData(accountId: string) {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([])
  const [rules, setRules] = useState<ComplianceRule[]>([])
  const [scores, setScores] = useState<ComplianceScore[]>([])
  const [dashboard, setDashboard] = useState<ComplianceDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFrameworks = async () => {
    try {
      console.log('Fetching frameworks from:', 'http://localhost:8000/api/compliance/frameworks')
      const response = await fetch('http://localhost:8000/api/compliance/frameworks')
      console.log('Frameworks response status:', response.status)
      if (!response.ok) throw new Error('Failed to fetch frameworks')
      const data = await response.json()
      console.log('Frameworks data:', data)
      setFrameworks(data)
    } catch (err) {
      console.error('Error fetching frameworks:', err)
      setError('Failed to fetch compliance frameworks')
    }
  }

  const fetchRules = async (frameworkId?: string) => {
    try {
      const url = frameworkId 
        ? `http://localhost:8000/api/compliance/rules?framework_id=${frameworkId}`
        : 'http://localhost:8000/api/compliance/rules'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch rules')
      const data = await response.json()
      setRules(data)
    } catch (err) {
      console.error('Error fetching rules:', err)
      setError('Failed to fetch compliance rules')
    }
  }

  const fetchScores = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/compliance/scores/${accountId}`)
      if (!response.ok) throw new Error('Failed to fetch scores')
      const data = await response.json()
      setScores(data)
    } catch (err) {
      console.error('Error fetching scores:', err)
      setError('Failed to fetch compliance scores')
    }
  }

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/compliance/dashboard/${accountId}`)
      if (!response.ok) throw new Error('Failed to fetch dashboard')
      const data = await response.json()
      setDashboard(data)
    } catch (err) {
      console.error('Error fetching dashboard:', err)
      setError('Failed to fetch compliance dashboard')
    }
  }

  const evaluateCompliance = async (frameworkId?: string, force = false) => {
    try {
      const response = await fetch('http://localhost:8000/api/compliance/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: accountId,
          framework_id: frameworkId,
          force_evaluation: force,
        }),
      })
      
      if (!response.ok) throw new Error('Failed to evaluate compliance')
      const data = await response.json()
      
      if (data.success) {
        // Refresh data after evaluation
        await Promise.all([
          fetchScores(),
          fetchDashboard(),
        ])
      }
      
      return data
    } catch (err) {
      console.error('Error evaluating compliance:', err)
      setError('Failed to evaluate compliance')
      throw err
    }
  }

  const refreshData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await Promise.all([
        fetchFrameworks(),
        fetchRules(),
        fetchScores(),
        fetchDashboard(),
      ])
    } catch (err) {
      console.error('Error refreshing compliance data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (accountId) {
      refreshData()
    }
  }, [accountId])

  return {
    frameworks,
    rules,
    scores,
    dashboard,
    loading,
    error,
    refreshData,
    evaluateCompliance,
    fetchRules,
  }
}
