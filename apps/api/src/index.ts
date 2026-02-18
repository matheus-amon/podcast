import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { errorMiddleware } from "./middleware/error.middleware";
import { loggerMiddleware } from "./middleware/logger.middleware";
import { leadsRoutes } from "./modules/leads/leads.controller";
import { agendaRoutes } from "./modules/agenda/agenda.controller";
import { budgetRoutes } from "./modules/budget/budget.controller";
import { billingRoutes } from "./modules/billing/billing.controller";
import { dashboardRoutes } from "./modules/dashboard/dashboard.controller";
import { whitelabelRoutes } from "./modules/whitelabel/whitelabel.controller";

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
            .use(leadsRoutes)
            .use(agendaRoutes)
            .use(budgetRoutes)
            .use(billingRoutes)
            .use(dashboardRoutes)
            .use(whitelabelRoutes)
    )
    .listen(3001);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
