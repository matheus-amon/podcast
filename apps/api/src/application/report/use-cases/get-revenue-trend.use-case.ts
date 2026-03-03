/**
 * Get Revenue Trend Use Case
 *
 * Caso de uso para obter tendência de receita (para gráficos)
 */

import type { IReportRepository } from '@domain/report/ports/report-repository.port';
import type { ReportFilters } from '@domain/report/types/report-data.types';
import { TimePeriod } from '@domain/report/value-objects/time-period.enum';

export interface RevenueTrendData {
  month: string;
  revenue: number;
  expenses: number;
}

export interface GetRevenueTrendUseCaseInput {
  period?: TimePeriod;
  months?: number;
}

export type GetRevenueTrendUseCaseOutput = RevenueTrendData[];

export class GetRevenueTrendUseCase {
  constructor(private readonly reportRepository: IReportRepository) {}

  async execute(input: GetRevenueTrendUseCaseInput = {}): Promise<GetRevenueTrendUseCaseOutput> {
    const months = input.months ?? 6;
    const filters: ReportFilters = {
      period: input.period ?? TimePeriod.MONTH,
    };

    const financialMetrics = await this.reportRepository.getFinancialMetrics(filters);

    return financialMetrics.monthlyTrend;
  }
}
