import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { errorMiddleware } from "./middleware/error.middleware";
import { loggerMiddleware } from "./middleware/logger.middleware";
import { createLeadsModule } from "./modules/leads/leads.module";
import { createWhitelabelModule } from "./modules/whitelabel/whitelabel.module";
import { agendaRoutes } from "./modules/agenda/agenda.controller";
import { budgetRoutes } from "./modules/budget/budget.controller";
import { billingRoutes } from "./modules/billing/billing.controller";
import { dashboardRoutes } from "./modules/dashboard/dashboard.controller";

// Create modules with hexagonal architecture
const leadsModule = createLeadsModule();
const whitelabelModule = createWhitelabelModule();

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
            .use(agendaRoutes)
            .use(budgetRoutes)
            .use(billingRoutes)
            .use(dashboardRoutes)
    )
    .listen(3001);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
