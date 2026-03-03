/**
 * Report Data Types
 *
 * Types para dados de relatórios
 */

import { ReportType } from '../value-objects/report-type.enum';
import { TimePeriod } from '../value-objects/time-period.enum';

/**
 * Métricas financeiras
 */
export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueByCategory: Array<{ category: string; amount: number }>;
  expensesByCategory: Array<{ category: string; amount: number }>;
  monthlyTrend: Array<{ month: string; revenue: number; expenses: number }>;
}

/**
 * Métricas de episódios
 */
export interface EpisodeMetrics {
  totalEpisodes: number;
  episodesByStatus: Array<{ status: string; count: number }>;
  recentEpisodes: Array<{
    id: number;
    title: string;
    status: string;
    createdAt: Date;
  }>;
  averageEpisodesPerMonth: number;
}

/**
 * Métricas de leads
 */
export interface LeadMetrics {
  totalLeads: number;
  leadsByStatus: Array<{ status: string; count: number }>;
  leadsBySource: Array<{ source: string; count: number }>;
  recentLeads: Array<{
    id: number;
    name: string;
    email: string;
    status: string;
    createdAt: Date;
  }>;
  conversionRate: number;
}

/**
 * Métricas de agenda
 */
export interface AgendaMetrics {
  totalEvents: number;
  upcomingEvents: number;
  eventsByType: Array<{ type: string; count: number }>;
  eventsByStatus: Array<{ status: string; count: number }>;
}

/**
 * Métricas gerais (Dashboard)
 */
export interface DashboardMetrics {
  totalLeads: number;
  activeEpisodes: number;
  monthlyRevenue: number;
  upcomingEvents: number;
  totalInvoices: number;
  pendingPayments: number;
}

/**
 * Filtros para relatórios
 */
export interface ReportFilters {
  type?: ReportType;
  period?: TimePeriod;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

/**
 * Resultado de relatório
 */
export interface ReportResult<T = any> {
  type: ReportType;
  period: TimePeriod;
  startDate: Date;
  endDate: Date;
  data: T;
  generatedAt: Date;
}
