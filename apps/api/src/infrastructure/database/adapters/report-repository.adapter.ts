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

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];
    const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];

    const [
      [revenueResult],
      [expensesResult],
      revenueByCategoryResult,
      expensesByCategoryResult,
      monthlyTrendResult
    ] = await Promise.all([
      db
        .select({ value: sum(budget.amount) })
        .from(budget)
        .where(and(eq(budget.type, 'INCOME'), gte(budget.date, startDateStr), lte(budget.date, endDateStr))),
      db
        .select({ value: sum(budget.amount) })
        .from(budget)
        .where(and(eq(budget.type, 'EXPENSE'), gte(budget.date, startDateStr), lte(budget.date, endDateStr))),
      db
        .select({ category: budget.category, amount: sum(budget.amount) })
        .from(budget)
        .where(and(eq(budget.type, 'INCOME'), gte(budget.date, startDateStr)))
        .groupBy(budget.category),
      db
        .select({ category: budget.category, amount: sum(budget.amount) })
        .from(budget)
        .where(and(eq(budget.type, 'EXPENSE'), gte(budget.date, startDateStr)))
        .groupBy(budget.category),
      db
        .select({
          month: sql<string>`to_char(${budget.date}, 'YYYY-MM')`,
          revenue: sql<number>`SUM(CASE WHEN ${budget.type} = 'INCOME' THEN ${budget.amount} ELSE 0 END)`,
          expenses: sql<number>`SUM(CASE WHEN ${budget.type} = 'EXPENSE' THEN ${budget.amount} ELSE 0 END)`,
        })
        .from(budget)
        .where(gte(budget.date, sixMonthsAgoStr))
        .groupBy(sql`to_char(${budget.date}, 'YYYY-MM')`)
        .orderBy(sql`to_char(${budget.date}, 'YYYY-MM')`)
    ]);

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

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      [totalResult],
      byStatusResult,
      recentEpisodes,
      [sixMonthCount]
    ] = await Promise.all([
      db.select({ value: count() }).from(episodes),
      db
        .select({ status: episodes.status, count: count() })
        .from(episodes)
        .groupBy(episodes.status),
      db
        .select({
          id: episodes.id,
          title: episodes.title,
          status: episodes.status,
          createdAt: episodes.createdAt,
        })
        .from(episodes)
        .orderBy(desc(episodes.createdAt))
        .limit(filters.limit ?? 5),
      db
        .select({ value: count() })
        .from(episodes)
        .where(gte(episodes.createdAt, sixMonthsAgo))
    ]);

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

    const [
      [totalResult],
      byStatusResult,
      bySourceResult,
      recentLeads,
      [recordedCount]
    ] = await Promise.all([
      db.select({ value: count() }).from(leads),
      db
        .select({ status: leads.status, count: count() })
        .from(leads)
        .groupBy(leads.status),
      db
        .select({ source: leads.source, count: count() })
        .from(leads)
        .groupBy(leads.source),
      db
        .select({
          id: leads.id,
          name: leads.name,
          email: leads.email,
          status: leads.status,
          createdAt: leads.createdAt,
        })
        .from(leads)
        .orderBy(desc(leads.createdAt))
        .limit(filters.limit ?? 5),
      db
        .select({ value: count() })
        .from(leads)
        .where(eq(leads.status, 'RECORDED'))
    ]);

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

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [
      [totalResult],
      [upcomingResult],
      byTypeResult,
      byStatusResult
    ] = await Promise.all([
      db.select({ value: count() }).from(agenda),
      db
        .select({ value: count() })
        .from(agenda)
        .where(and(gte(agenda.startDate, now), lte(agenda.startDate, nextWeek))),
      db
        .select({ type: agenda.type, count: count() })
        .from(agenda)
        .groupBy(agenda.type),
      db
        .select({ status: agenda.status, count: count() })
        .from(agenda)
        .groupBy(agenda.status)
    ]);

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

    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [
      [leadsResult],
      [activeEpisodesResult],
      [revenueResult],
      [upcomingEventsResult],
      [invoicesResult],
      [pendingPaymentsResult]
    ] = await Promise.all([
      db.select({ value: count() }).from(leads),
      db
        .select({ value: count() })
        .from(episodes)
        .where(sql`${episodes.status} != 'PUBLISHED'`),
      db
        .select({ value: sum(budget.amount) })
        .from(budget)
        .where(and(eq(budget.type, 'INCOME'), gte(budget.date, startDateStr))),
      db
        .select({ value: count() })
        .from(agenda)
        .where(and(gte(agenda.startDate, now), lte(agenda.startDate, nextWeek))),
      db.select({ value: count() }).from(billing),
      db
        .select({ value: count() })
        .from(payments)
        .where(eq(payments.status, PaymentStatus.PENDING))
    ]);

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
