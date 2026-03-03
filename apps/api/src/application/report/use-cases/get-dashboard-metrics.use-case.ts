/**
 * Get Dashboard Metrics Use Case
 *
 * Caso de uso para obter métricas gerais do dashboard
 */

import type { IReportRepository } from '@domain/report/ports/report-repository.port';
import type { ReportFilters, DashboardMetrics } from '@domain/report/types/report-data.types';
import { TimePeriod } from '@domain/report/value-objects/time-period.enum';

export interface GetDashboardMetricsUseCaseInput {
  period?: TimePeriod;
  startDate?: Date;
  endDate?: Date;
}

export type GetDashboardMetricsUseCaseOutput = DashboardMetrics;

export class GetDashboardMetricsUseCase {
  constructor(private readonly reportRepository: IReportRepository) {}

  async execute(input: GetDashboardMetricsUseCaseInput = {}): Promise<GetDashboardMetricsUseCaseOutput> {
    const filters: ReportFilters = {
      period: input.period ?? TimePeriod.MONTH,
      startDate: input.startDate,
      endDate: input.endDate,
    };

    const metrics = await this.reportRepository.getDashboardMetrics(filters);

    return metrics;
  }
}
