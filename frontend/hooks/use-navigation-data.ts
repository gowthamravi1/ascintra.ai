import { useState, useEffect } from 'react'

interface NavigationData {
  inventory: {
    total_assets: number
    protected_assets: number
    unprotected_assets: number
    coverage_percentage: number
    service_counts: Record<string, number>
    badge: string
  }
  recovery_posture: {
    recovery_score: number
    backup_coverage: number
    total_scans: number
    completed_scans: number
    success_rate: number
    avg_recent_score: number
    badge: string
  }
  discovery: {
    total_accounts: number
    active_accounts: number
    badge: string
  }
  compliance: {
    compliance_score: number
    audit_reports: number
    policies: number
    badge: string
  }
  drift: {
    drift_issues: number
    critical_drift: number
    warning_drift: number
    badge: string
  }
  recovery_testing: {
    total_tests: number
    passed_tests: number
    failed_tests: number
    success_rate: number
    badge: string
  }
}

interface UseNavigationDataReturn {
  data: NavigationData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useNavigationData(accountIdentifier?: string): UseNavigationDataReturn {
  const [data, setData] = useState<NavigationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (accountIdentifier) {
        params.append('account_identifier', accountIdentifier)
      }
      
      const response = await fetch(`/api/tenant/navigation/data?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch navigation data: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error('Failed to fetch navigation data')
      }
    } catch (err) {
      console.error('Error fetching navigation data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      
      // Set fallback data
      setData({
        inventory: {
          total_assets: 0,
          protected_assets: 0,
          unprotected_assets: 0,
          coverage_percentage: 0,
          service_counts: {},
          badge: "0"
        },
        recovery_posture: {
          recovery_score: 0,
          backup_coverage: 0,
          total_scans: 0,
          completed_scans: 0,
          success_rate: 0,
          avg_recent_score: 0,
          badge: "0%"
        },
        discovery: {
          total_accounts: 0,
          active_accounts: 0,
          badge: "0"
        },
        compliance: {
          compliance_score: 0,
          audit_reports: 0,
          policies: 0,
          badge: "N/A"
        },
        drift: {
          drift_issues: 0,
          critical_drift: 0,
          warning_drift: 0,
          badge: "0"
        },
        recovery_testing: {
          total_tests: 0,
          passed_tests: 0,
          failed_tests: 0,
          success_rate: 0,
          badge: "0"
        }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [accountIdentifier])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}
