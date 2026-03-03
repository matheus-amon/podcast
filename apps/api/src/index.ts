import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { errorMiddleware } from "./middleware/error.middleware";
import { loggerMiddleware } from "./middleware/logger.middleware";
import { createLeadsModule } from "./modules/leads/leads.module";
import { createWhitelabelModule } from "./modules/whitelabel/whitelabel.module";
import { createAgendaModule } from "./modules/agenda/agenda.module";
import { createBudgetModule } from "./modules/budget/budget.module";
import { createBillingModule } from "./modules/billing/billing.module";
import { createReportModule } from "./modules/report/report.module";
import { dashboardRoutes } from "./modules/dashboard/dashboard.controller";

// Create modules with hexagonal architecture
const leadsModule = createLeadsModule();
const whitelabelModule = createWhitelabelModule();
const agendaModule = createAgendaModule();
const budgetModule = createBudgetModule();
const billingModule = createBillingModule();
const reportModule = createReportModule();

const app = new Elysia()
    .use(swagger())
    .use(errorMiddleware)      // Register BEFORE routes
    .use(loggerMiddleware)     // Register BEFORE routes
    // Health check endpoint
    .get("/health", async () => {
        return {
            status: 'ok',
            timestamp: new Date().toISOString()
        };
    })
    .group("/api", (app) =>
        app
            .use(leadsModule.routes)      // New hexagonal module
            .use(whitelabelModule.routes) // New hexagonal module
            .use(agendaModule.routes)     // New hexagonal module
            .use(budgetModule.routes)     // New hexagonal module
            .use(billingModule.routes)    // New hexagonal module
            .use(reportModule.routes)     // New hexagonal module
            .use(dashboardRoutes)         // Legacy - to be removed
    )
    .listen(3001);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
