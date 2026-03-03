/**
 * Get Lead Report Use Case
 *
 * Caso de uso para obter relatório de leads
 */

import type { IReportRepository } from '@domain/report/ports/report-repository.port';
import type { ReportFilters, LeadMetrics } from '@domain/report/types/report-data.types';
import { TimePeriod } from '@domain/report/value-objects/time-period.enum';

export interface GetLeadReportUseCaseInput {
  period?: TimePeriod;
  startDate?: Date;
  endDate?: Date;
}

export type GetLeadReportUseCaseOutput = LeadMetrics;

export class GetLeadReportUseCase {
  constructor(private readonly reportRepository: IReportRepository) {}

  async execute(input: GetLeadReportUseCaseInput = {}): Promise<GetLeadReportUseCaseOutput> {
    const filters: ReportFilters = {
      period: input.period ?? TimePeriod.MONTH,
      startDate: input.startDate,
      endDate: input.endDate,
    };

    const metrics = await this.reportRepository.getLeadMetrics(filters);

    return metrics;
  }
}
