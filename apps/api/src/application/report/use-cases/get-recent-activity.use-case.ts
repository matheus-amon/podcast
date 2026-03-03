/**
 * Get Recent Activity Use Case
 *
 * Caso de uso para obter atividade recente (leads e episódios)
 */

import type { IReportRepository } from '@domain/report/ports/report-repository.port';
import type { ReportFilters, LeadMetrics, EpisodeMetrics } from '@domain/report/types/report-data.types';

export interface RecentActivityData {
  recentLeads: LeadMetrics['recentLeads'];
  recentEpisodes: EpisodeMetrics['recentEpisodes'];
}

export interface GetRecentActivityUseCaseInput {
  limit?: number;
}

export type GetRecentActivityUseCaseOutput = RecentActivityData;

export class GetRecentActivityUseCase {
  constructor(private readonly reportRepository: IReportRepository) {}

  async execute(input: GetRecentActivityUseCaseInput = {}): Promise<GetRecentActivityUseCaseOutput> {
    const filters: ReportFilters = {
      limit: input.limit ?? 5,
    };

    const [leadMetrics, episodeMetrics] = await Promise.all([
      this.reportRepository.getLeadMetrics(filters),
      this.reportRepository.getEpisodeMetrics(filters),
    ]);

    return {
      recentLeads: leadMetrics.recentLeads,
      recentEpisodes: episodeMetrics.recentEpisodes,
    };
  }
}
