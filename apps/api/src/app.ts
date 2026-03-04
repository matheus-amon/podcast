import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { errorMiddleware } from './middleware/error.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';
import { createLeadsModule } from './modules/leads/leads.module';
import { createWhitelabelModule } from './modules/whitelabel/whitelabel.module';
import { createAgendaModule } from './modules/agenda/agenda.module';
import { createBudgetModule } from './modules/budget/budget.module';
import { createBillingModule } from './modules/billing/billing.module';
import { createReportModule } from './modules/report/report.module';
import { createAuthModule } from './modules/auth/auth.module';

export function createApp() {
  const leadsModule = createLeadsModule();
  const whitelabelModule = createWhitelabelModule();
  const agendaModule = createAgendaModule();
  const budgetModule = createBudgetModule();
  const billingModule = createBillingModule();
  const reportModule = createReportModule();
  const authModule = createAuthModule();

  return new Elysia()
    .use(swagger())
    .use(errorMiddleware)
    .use(loggerMiddleware)
    .get('/health', async () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }))
    .group('/api', (app) =>
      app
        .use(leadsModule.routes)
        .use(whitelabelModule.routes)
        .use(agendaModule.routes)
        .use(budgetModule.routes)
        .use(billingModule.routes)
        .use(reportModule.routes)
        .use(authModule.routes)
    );
}
