/**
 * Get Financial Report Use Case
 *
 * Caso de uso para obter relatório financeiro
 */

import type { IReportRepository } from '@domain/report/ports/report-repository.port';
import type { ReportFilters, FinancialMetrics } from '@domain/report/types/report-data.types';
import { TimePeriod } from '@domain/report/value-objects/time-period.enum';

export interface GetFinancialReportUseCaseInput {
  period?: TimePeriod;
  startDate?: Date;
  endDate?: Date;
}

export type GetFinancialReportUseCaseOutput = FinancialMetrics;

export class GetFinancialReportUseCase {
  constructor(private readonly reportRepository: IReportRepository) {}

  async execute(input: GetFinancialReportUseCaseInput = {}): Promise<GetFinancialReportUseCaseOutput> {
    const filters: ReportFilters = {
      period: input.period ?? TimePeriod.MONTH,
      startDate: input.startDate,
      endDate: input.endDate,
    };

    const metrics = await this.reportRepository.getFinancialMetrics(filters);

    return metrics;
  }
}
