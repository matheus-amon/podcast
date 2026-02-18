import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { leadsRoutes } from "./modules/leads/leads.controller";
import { agendaRoutes } from "./modules/agenda/agenda.controller";
import { budgetRoutes } from "./modules/budget/budget.controller";
import { billingRoutes } from "./modules/billing/billing.controller";
import { dashboardRoutes } from "./modules/dashboard/dashboard.controller";
import { whitelabelRoutes } from "./modules/whitelabel/whitelabel.controller";

const app = new Elysia()
    .use(swagger())
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
