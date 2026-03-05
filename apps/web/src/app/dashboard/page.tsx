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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-destructive">
          <p>Error loading dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to Podcast SaaS"
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Leads"
          value={data?.totalLeads ?? 0}
          icon={Users}
          trend={{ value: '+12%', type: 'positive' }}
        />
        <KPICard
          title="Monthly Revenue"
          value={`$${data?.monthlyRevenue ?? 0}`}
          icon={DollarSign}
          trend={{ value: '+8.5%', type: 'positive' }}
        />
        <KPICard
          title="Active Episodes"
          value={data?.activeEpisodes ?? 0}
          icon={Calendar}
          trend={{ value: '-2.5%', type: 'negative' }}
        />
        <KPICard
          title="Upcoming Events"
          value={data?.upcomingEvents ?? 0}
          icon={TrendingUp}
          trend={{ value: '+5%', type: 'positive' }}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart />
        <ActivityFeed />
      </div>
    </div>
  );
}

export default withAuth(DashboardContent);
