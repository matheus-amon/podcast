/**
 * Report Module Composition Root
 *
 * Configura injeção de dependência para o módulo Report
 * Este é o ponto de composição do módulo
 */

import { PostgresReportRepository } from '@infrastructure/database/adapters/report-repository.adapter';
import { ReportController } from '@infrastructure/http/adapters/report.controller';
import { GetDashboardMetricsUseCase } from '@application/report/use-cases/get-dashboard-metrics.use-case';
import { GetFinancialReportUseCase } from '@application/report/use-cases/get-financial-report.use-case';
import { GetEpisodeReportUseCase } from '@application/report/use-cases/get-episode-report.use-case';
import { GetLeadReportUseCase } from '@application/report/use-cases/get-lead-report.use-case';
import { GetRevenueTrendUseCase } from '@application/report/use-cases/get-revenue-trend.use-case';
import { GetRecentActivityUseCase } from '@application/report/use-cases/get-recent-activity.use-case';

/**
 * Cria e configura todas as dependências do módulo Report
 */
export function createReportModule(): ReportController {
  // Infrastructure layer (repository adapter)
  const reportRepository = new PostgresReportRepository();

  // Application layer (use cases)
  const getDashboardMetricsUseCase = new GetDashboardMetricsUseCase(reportRepository);
  const getFinancialReportUseCase = new GetFinancialReportUseCase(reportRepository);
  const getEpisodeReportUseCase = new GetEpisodeReportUseCase(reportRepository);
  const getLeadReportUseCase = new GetLeadReportUseCase(reportRepository);
  const getRevenueTrendUseCase = new GetRevenueTrendUseCase(reportRepository);
  const getRecentActivityUseCase = new GetRecentActivityUseCase(reportRepository);

  // Infrastructure layer (HTTP controller)
  const reportController = new ReportController(
    getDashboardMetricsUseCase,
    getFinancialReportUseCase,
    getEpisodeReportUseCase,
    getLeadReportUseCase,
    getRevenueTrendUseCase,
    getRecentActivityUseCase
  );

  return reportController;
}
