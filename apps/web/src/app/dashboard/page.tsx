'use client';

import { withAuth } from '@/lib/auth/with-auth';
import { KPICard } from '@/components/dashboard/kpi-card';
import { PageHeader } from '@/components/dashboard/page-header';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { useDashboard } from '@/hooks/use-dashboard';
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';

function DashboardContent() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-destructive">
          <p>Error loading dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Dashboard"
          subtitle="Welcome to Podcast SaaS"
        />

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <KPICard
            title="Total Leads"
            value={data?.totalLeads ?? 0}
            icon={Users}
            trend={12}
          />
          <KPICard
            title="Monthly Revenue"
            value={`$${data?.monthlyRevenue ?? 0}`}
            icon={DollarSign}
            trend={8.5}
          />
          <KPICard
            title="Active Episodes"
            value={data?.activeEpisodes ?? 0}
            icon={Calendar}
            trend={-2.5}
          />
          <KPICard
            title="Upcoming Events"
            value={data?.upcomingEvents ?? 0}
            icon={TrendingUp}
            trend={5}
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <RevenueChart />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}

export default withAuth(DashboardContent);
