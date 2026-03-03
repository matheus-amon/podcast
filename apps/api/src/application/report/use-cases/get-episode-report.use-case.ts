/**
 * Get Episode Report Use Case
 *
 * Caso de uso para obter relatório de episódios
 */

import type { IReportRepository } from '@domain/report/ports/report-repository.port';
import type { ReportFilters, EpisodeMetrics } from '@domain/report/types/report-data.types';
import { TimePeriod } from '@domain/report/value-objects/time-period.enum';

export interface GetEpisodeReportUseCaseInput {
  period?: TimePeriod;
  startDate?: Date;
  endDate?: Date;
}

export type GetEpisodeReportUseCaseOutput = EpisodeMetrics;

export class GetEpisodeReportUseCase {
  constructor(private readonly reportRepository: IReportRepository) {}

  async execute(input: GetEpisodeReportUseCaseInput = {}): Promise<GetEpisodeReportUseCaseOutput> {
    const filters: ReportFilters = {
      period: input.period ?? TimePeriod.MONTH,
      startDate: input.startDate,
      endDate: input.endDate,
    };

    const metrics = await this.reportRepository.getEpisodeMetrics(filters);

    return metrics;
  }
}
