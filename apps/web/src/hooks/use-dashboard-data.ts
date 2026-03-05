'use client'

import { useQuery } from '@tanstack/react-query'
import { getDashboardMetrics, getRevenueTrend, getActivityData } from './use-dashboard'

export function useDashboardData() {
  const metricsQuery = useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: getDashboardMetrics,
  })

  const trendQuery = useQuery({
    queryKey: ['dashboard', 'trend'],
    queryFn: () => getRevenueTrend(6),
  })

  const activityQuery = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: getActivityData,
  })

  return {
    metrics: metricsQuery.data,
    trend: trendQuery.data,
    activity: activityQuery.data,
    isLoading: metricsQuery.isLoading || trendQuery.isLoading || activityQuery.isLoading,
    isError: metricsQuery.isError || trendQuery.isError || activityQuery.isError,
  }
}
