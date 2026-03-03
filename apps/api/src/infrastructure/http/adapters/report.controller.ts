/**
 * Report Controller
 *
 * Controller HTTP para operações de Report
 * Expõe endpoints RESTful para relatórios e métricas
 */

import { Elysia, t } from 'elysia';
import { GetDashboardMetricsUseCase } from '@application/report/use-cases/get-dashboard-metrics.use-case';
import { GetFinancialReportUseCase } from '@application/report/use-cases/get-financial-report.use-case';
import { GetEpisodeReportUseCase } from '@application/report/use-cases/get-episode-report.use-case';
import { GetLeadReportUseCase } from '@application/report/use-cases/get-lead-report.use-case';
import { GetRevenueTrendUseCase } from '@application/report/use-cases/get-revenue-trend.use-case';
import { GetRecentActivityUseCase } from '@application/report/use-cases/get-recent-activity.use-case';
import { TimePeriod } from '@domain/report/value-objects/time-period.enum';

export class ReportController {
  public routes: Elysia;

  constructor(
    private readonly getDashboardMetricsUseCase: GetDashboardMetricsUseCase,
    private readonly getFinancialReportUseCase: GetFinancialReportUseCase,
    private readonly getEpisodeReportUseCase: GetEpisodeReportUseCase,
    private readonly getLeadReportUseCase: GetLeadReportUseCase,
    private readonly getRevenueTrendUseCase: GetRevenueTrendUseCase,
    private readonly getRecentActivityUseCase: GetRecentActivityUseCase
  ) {
    this.routes = this.createRoutes();
  }

  /**
   * Cria as rotas do controller
   */
  private createRoutes(): Elysia {
    return new Elysia({ prefix: '/reports' })
      // GET /reports/dashboard - Métricas do dashboard
      .get(
        '/dashboard',
        async ({ query }) => {
          const metrics = await this.getDashboardMetricsUseCase.execute({
            period: query.period as TimePeriod | undefined,
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
          });

          return metrics;
        },
        {
          query: t.Object({
            period: t.Optional(t.Enum(TimePeriod)),
            startDate: t.Optional(t.String({ format: 'date-time' })),
            endDate: t.Optional(t.String({ format: 'date-time' })),
          }),
        }
      )

      // GET /reports/financial - Relatório financeiro
      .get(
        '/financial',
        async ({ query }) => {
          const metrics = await this.getFinancialReportUseCase.execute({
            period: query.period as TimePeriod | undefined,
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
          });

          return metrics;
        },
        {
          query: t.Object({
            period: t.Optional(t.Enum(TimePeriod)),
            startDate: t.Optional(t.String({ format: 'date-time' })),
            endDate: t.Optional(t.String({ format: 'date-time' })),
          }),
        }
      )

      // GET /reports/financial/trend - Tendência de receita (gráficos)
      .get(
        '/financial/trend',
        async ({ query }) => {
          const trend = await this.getRevenueTrendUseCase.execute({
            period: query.period as TimePeriod | undefined,
            months: query.months,
          });

          return trend;
        },
        {
          query: t.Object({
            period: t.Optional(t.Enum(TimePeriod)),
            months: t.Optional(t.Number()),
          }),
        }
      )

      // GET /reports/episodes - Relatório de episódios
      .get(
        '/episodes',
        async ({ query }) => {
          const metrics = await this.getEpisodeReportUseCase.execute({
            period: query.period as TimePeriod | undefined,
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
          });

          return metrics;
        },
        {
          query: t.Object({
            period: t.Optional(t.Enum(TimePeriod)),
            startDate: t.Optional(t.String({ format: 'date-time' })),
            endDate: t.Optional(t.String({ format: 'date-time' })),
          }),
        }
      )

      // GET /reports/leads - Relatório de leads
      .get(
        '/leads',
        async ({ query }) => {
          const metrics = await this.getLeadReportUseCase.execute({
            period: query.period as TimePeriod | undefined,
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
          });

          return metrics;
        },
        {
          query: t.Object({
            period: t.Optional(t.Enum(TimePeriod)),
            startDate: t.Optional(t.String({ format: 'date-time' })),
            endDate: t.Optional(t.String({ format: 'date-time' })),
          }),
        }
      )

      // GET /reports/recent-activity - Atividade recente
      .get(
        '/recent-activity',
        async ({ query }) => {
          const activity = await this.getRecentActivityUseCase.execute({
            limit: query.limit,
          });

          return activity;
        },
        {
          query: t.Object({
            limit: t.Optional(t.Number()),
          }),
        }
      );
  }
}
