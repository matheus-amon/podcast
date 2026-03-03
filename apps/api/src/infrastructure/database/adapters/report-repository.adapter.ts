/**
 * Postgres Report Repository
 *
 * Implementação do Report Repository usando PostgreSQL
 * Focado em queries de leitura para relatórios
 */

import { db } from '@db/index';
import {
  leads,
  episodes,
  budget,
  agenda,
  billing,
  payments,
} from '@db/schema';
import { sql, desc, count, and, gte, lte, eq, sum } from 'drizzle-orm';
import type {
  IReportRepository,
  ReportFilters,
  FinancialMetrics,
  EpisodeMetrics,
  LeadMetrics,
  AgendaMetrics,
  DashboardMetrics,
  ReportResult,
} from '@domain/report/types/report-data.types';
import { TimePeriod, getDateRange } from '@domain/report/value-objects/time-period.enum';
import { ReportType } from '@domain/report/value-objects/report-type.enum';
import { BillingStatus } from '@domain/billing/value-objects/billing-status.enum';
import { PaymentStatus } from '@domain/billing/value-objects/payment-status.enum';

export class PostgresReportRepository implements IReportRepository {
  /**
   * Obter métricas financeiras
   */
  async getFinancialMetrics(filters: ReportFilters): Promise<FinancialMetrics> {
    const { start, end } = this.getDateRange(filters.period ?? TimePeriod.MONTH, filters.startDate, filters.endDate);

    // Total revenue (INCOME)
    const [revenueResult] = await db
      .select({ value: sum(budget.amount) })
      .from(budget)
      .where(and(eq(budget.type, 'INCOME'), gte(budget.date, start.toISOString().split('T')[0]), lte(budget.date, end.toISOString().split('T')[0])));

    // Total expenses (EXPENSE)
    const [expensesResult] = await db
      .select({ value: sum(budget.amount) })
      .from(budget)
      .where(and(eq(budget.type, 'EXPENSE'), gte(budget.date, start.toISOString().split('T')[0]), lte(budget.date, end.toISOString().split('T')[0])));

    // Revenue by category
    const revenueByCategoryResult = await db
      .select({
        category: budget.category,
        amount: sum(budget.amount),
      })
      .from(budget)
      .where(and(eq(budget.type, 'INCOME'), gte(budget.date, start.toISOString().split('T')[0])))
      .groupBy(budget.category);

    // Expenses by category
    const expensesByCategoryResult = await db
      .select({
        category: budget.category,
        amount: sum(budget.amount),
      })
      .from(budget)
      .where(and(eq(budget.type, 'EXPENSE'), gte(budget.date, start.toISOString().split('T')[0])))
      .groupBy(budget.category);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrendResult = await db
      .select({
        month: sql<string>`to_char(${budget.date}, 'YYYY-MM')`,
        revenue: sql<number>`SUM(CASE WHEN ${budget.type} = 'INCOME' THEN ${budget.amount} ELSE 0 END)`,
        expenses: sql<number>`SUM(CASE WHEN ${budget.type} = 'EXPENSE' THEN ${budget.amount} ELSE 0 END)`,
      })
      .from(budget)
      .where(gte(budget.date, sixMonthsAgo.toISOString().split('T')[0]))
      .groupBy(sql`to_char(${budget.date}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${budget.date}, 'YYYY-MM')`);

    const totalRevenue = Number(revenueResult?.value ?? 0);
    const totalExpenses = Number(expensesResult?.value ?? 0);

    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      revenueByCategory: revenueByCategoryResult.map((r) => ({
        category: r.category ?? 'Unknown',
        amount: Number(r.amount ?? 0),
      })),
      expensesByCategory: expensesByCategoryResult.map((r) => ({
        category: r.category ?? 'Unknown',
        amount: Number(r.amount ?? 0),
      })),
      monthlyTrend: monthlyTrendResult.map((r) => ({
        month: r.month,
        revenue: Number(r.revenue ?? 0),
        expenses: Number(r.expenses ?? 0),
      })),
    };
  }

  /**
   * Obter métricas de episódios
   */
  async getEpisodeMetrics(filters: ReportFilters): Promise<EpisodeMetrics> {
    const { start, end } = this.getDateRange(filters.period ?? TimePeriod.MONTH, filters.startDate, filters.endDate);

    // Total episodes
    const [totalResult] = await db.select({ value: count() }).from(episodes);

    // Episodes by status
    const byStatusResult = await db
      .select({
        status: episodes.status,
        count: count(),
      })
      .from(episodes)
      .groupBy(episodes.status);

    // Recent episodes
    const recentEpisodes = await db
      .select({
        id: episodes.id,
        title: episodes.title,
        status: episodes.status,
        createdAt: episodes.createdAt,
      })
      .from(episodes)
      .orderBy(desc(episodes.createdAt))
      .limit(filters.limit ?? 5);

    // Average episodes per month
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [sixMonthCount] = await db
      .select({ value: count() })
      .from(episodes)
      .where(gte(episodes.createdAt, sixMonthsAgo));

    const totalEpisodes = Number(totalResult?.value ?? 0);
    const avgPerMonth = totalEpisodes > 0 ? Math.round(totalEpisodes / 6) : 0;

    return {
      totalEpisodes,
      episodesByStatus: byStatusResult.map((r) => ({
        status: r.status ?? 'UNKNOWN',
        count: Number(r.count ?? 0),
      })),
      recentEpisodes: recentEpisodes.map((r) => ({
        id: r.id,
        title: r.title ?? 'Untitled',
        status: r.status ?? 'PLANNED',
        createdAt: r.createdAt ?? new Date(),
      })),
      averageEpisodesPerMonth: avgPerMonth,
    };
  }

  /**
   * Obter métricas de leads
   */
  async getLeadMetrics(filters: ReportFilters): Promise<LeadMetrics> {
    const { start, end } = this.getDateRange(filters.period ?? TimePeriod.MONTH, filters.startDate, filters.endDate);

    // Total leads
    const [totalResult] = await db.select({ value: count() }).from(leads);

    // Leads by status
    const byStatusResult = await db
      .select({
        status: leads.status,
        count: count(),
      })
      .from(leads)
      .groupBy(leads.status);

    // Leads by source
    const bySourceResult = await db
      .select({
        source: leads.source,
        count: count(),
      })
      .from(leads)
      .groupBy(leads.source);

    // Recent leads
    const recentLeads = await db
      .select({
        id: leads.id,
        name: leads.name,
        email: leads.email,
        status: leads.status,
        createdAt: leads.createdAt,
      })
      .from(leads)
      .orderBy(desc(leads.createdAt))
      .limit(filters.limit ?? 5);

    // Conversion rate (RECORDED / total)
    const [recordedCount] = await db
      .select({ value: count() })
      .from(leads)
      .where(eq(leads.status, 'RECORDED'));

    const totalLeads = Number(totalResult?.value ?? 0);
    const recordedLeads = Number(recordedCount?.value ?? 0);
    const conversionRate = totalLeads > 0 ? Math.round((recordedLeads / totalLeads) * 100) : 0;

    return {
      totalLeads,
      leadsByStatus: byStatusResult.map((r) => ({
        status: r.status ?? 'UNKNOWN',
        count: Number(r.count ?? 0),
      })),
      leadsBySource: bySourceResult.map((r) => ({
        source: r.source ?? 'unknown',
        count: Number(r.count ?? 0),
      })),
      recentLeads: recentLeads.map((r) => ({
        id: r.id,
        name: r.name ?? 'Unknown',
        email: r.email ?? '',
        status: r.status ?? 'PROSPECT',
        createdAt: r.createdAt ?? new Date(),
      })),
      conversionRate,
    };
  }

  /**
   * Obter métricas de agenda
   */
  async getAgendaMetrics(filters: ReportFilters): Promise<AgendaMetrics> {
    const { start, end } = this.getDateRange(filters.period ?? TimePeriod.MONTH, filters.startDate, filters.endDate);
    const now = new Date();

    // Total events
    const [totalResult] = await db.select({ value: count() }).from(agenda);

    // Upcoming events (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [upcomingResult] = await db
      .select({ value: count() })
      .from(agenda)
      .where(and(gte(agenda.startDate, now), lte(agenda.startDate, nextWeek)));

    // Events by type
    const byTypeResult = await db
      .select({
        type: agenda.type,
        count: count(),
      })
      .from(agenda)
      .groupBy(agenda.type);

    // Events by status
    const byStatusResult = await db
      .select({
        status: agenda.status,
        count: count(),
      })
      .from(agenda)
      .groupBy(agenda.status);

    return {
      totalEvents: Number(totalResult?.value ?? 0),
      upcomingEvents: Number(upcomingResult?.value ?? 0),
      eventsByType: byTypeResult.map((r) => ({
        type: r.type ?? 'OTHER',
        count: Number(r.count ?? 0),
      })),
      eventsByStatus: byStatusResult.map((r) => ({
        status: r.status ?? 'SCHEDULED',
        count: Number(r.count ?? 0),
      })),
    };
  }

  /**
   * Obter métricas do dashboard (combinadas)
   */
  async getDashboardMetrics(filters?: ReportFilters): Promise<DashboardMetrics> {
    const { start, end } = this.getDateRange(filters?.period ?? TimePeriod.MONTH, filters?.startDate, filters?.endDate);
    const startDateStr = start.toISOString().split('T')[0];

    // 1. Total Leads
    const [leadsResult] = await db.select({ value: count() }).from(leads);

    // 2. Active Episodes (not PUBLISHED)
    const [activeEpisodesResult] = await db
      .select({ value: count() })
      .from(episodes)
      .where(sql`${episodes.status} != 'PUBLISHED'`);

    // 3. Monthly Revenue (INCOME for current period)
    const [revenueResult] = await db
      .select({ value: sum(budget.amount) })
      .from(budget)
      .where(and(eq(budget.type, 'INCOME'), gte(budget.date, startDateStr)));

    // 4. Upcoming Events (next 7 days)
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [upcomingEventsResult] = await db
      .select({ value: count() })
      .from(agenda)
      .where(and(gte(agenda.startDate, now), lte(agenda.startDate, nextWeek)));

    // 5. Total Invoices
    const [invoicesResult] = await db.select({ value: count() }).from(billing);

    // 6. Pending Payments
    const [pendingPaymentsResult] = await db
      .select({ value: count() })
      .from(payments)
      .where(eq(payments.status, PaymentStatus.PENDING));

    return {
      totalLeads: Number(leadsResult?.value ?? 0),
      activeEpisodes: Number(activeEpisodesResult?.value ?? 0),
      monthlyRevenue: Number(revenueResult?.value ?? 0),
      upcomingEvents: Number(upcomingEventsResult?.value ?? 0),
      totalInvoices: Number(invoicesResult?.value ?? 0),
      pendingPayments: Number(pendingPaymentsResult?.value ?? 0),
    };
  }

  /**
   * Obter relatório customizado
   */
  async getCustomReport(filters: ReportFilters): Promise<ReportResult> {
    const { start, end } = this.getDateRange(filters.period ?? TimePeriod.MONTH, filters.startDate, filters.endDate);

    // Dados genéricos para relatório customizado
    const data = {
      summary: {
        totalRecords: 0,
        dateRange: { start, end },
      },
    };

    return {
      type: filters.type ?? ReportType.CUSTOM,
      period: filters.period ?? TimePeriod.CUSTOM,
      startDate: start,
      endDate: end,
      data,
      generatedAt: new Date(),
    };
  }

  /**
   * Obter range de datas para um período
   */
  getDateRange(period: TimePeriod, customStart?: Date, customEnd?: Date): { start: Date; end: Date } {
    return getDateRange(period, customStart, customEnd);
  }
}
