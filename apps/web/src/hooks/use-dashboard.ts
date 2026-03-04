import { fetchAPI } from "@/lib/api"
import { useQuery } from '@tanstack/react-query'

export interface DashboardMetrics {
  totalLeads: number
  activeEpisodes: number
  monthlyRevenue: number
  upcomingEvents: number
  totalInvoices: number
  pendingPayments: number
}

export interface RevenueTrend {
  name: string
  revenue: number
  expenses: number
}

export interface ActivityData {
  recentLeads: Array<{
    id: number
    name: string
    company: string | null
    avatarUrl: string | null
  }>
  recentEpisodes: Array<{
    id: number
    title: string
    status: string
  }>
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return fetchAPI('/api/reports/dashboard')
}

export async function getRevenueTrend(months = 6): Promise<RevenueTrend[]> {
  return fetchAPI(`/api/reports/financial/trend?months=${months}`)
}

export async function getActivityData(): Promise<ActivityData> {
  return fetchAPI('/api/reports/recent-activity?limit=5')
}

export function useDashboard() {
  const { data, isLoading, error } = useQuery<DashboardMetrics>({
    queryKey: ['dashboard', 'metrics'],
    queryFn: getDashboardMetrics,
  })

  return { data, isLoading, error }
}
