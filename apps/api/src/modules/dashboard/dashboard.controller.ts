import { Elysia, t } from "elysia";
import { db } from "../../db";
import { leads, episodes, budget, agenda } from "../../db/schema";
import { sql, desc, count, and, gte, lte, eq } from "drizzle-orm";

export const dashboardRoutes = new Elysia({ prefix: "/dashboard" })
    .get("/metrics", async () => {
        // 3. Revenue (Current Month) - Use date string for date column comparison
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const startDateStr = startOfMonth.toISOString().split('T')[0]; // YYYY-MM-DD format

        // 4. Upcoming Events (Next 7 days)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        // Execute all independent queries concurrently using Promise.all
        const [
            leadsResultArray,
            activeEpisodesResultArray,
            revenueResultArray,
            upcomingEventsResultArray
        ] = await Promise.all([
            // 1. Leads Count (Total)
            db.select({ value: count() }).from(leads),

            // 2. Active Episodes (Not Published)
            db.select({ value: count() }).from(episodes).where(sql`${episodes.status} != 'PUBLISHED'`),

            // 3. Revenue (Current Month)
            db.select({ value: sql<number>`sum(${budget.amount})` })
                .from(budget)
                .where(and(
                    eq(budget.type, 'INCOME'),
                    gte(budget.date, startDateStr!)
                )),

            // 4. Upcoming Events (Next 7 days)
            db.select({ value: count() })
                .from(agenda)
                .where(and(
                    gte(agenda.startDate, new Date()),
                    lte(agenda.startDate, nextWeek)
                ))
        ]);

        return {
            totalLeads: leadsResultArray[0]?.value || 0,
            activeEpisodes: activeEpisodesResultArray[0]?.value || 0,
            monthlyRevenue: revenueResultArray[0]?.value || 0,
            upcomingEvents: upcomingEventsResultArray[0]?.value || 0
        };
    })
    .get("/charts/revenue", async () => {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const startDateStr = startOfMonth.toISOString().split('T')[0]; // YYYY-MM-DD format

        const [currentRevenue] = await db.select({ value: sql<number>`sum(${budget.amount})` })
            .from(budget)
            .where(and(
                eq(budget.type, 'INCOME'),
                gte(budget.date, startDateStr!)
            ));

        const [currentExpense] = await db.select({ value: sql<number>`sum(${budget.amount})` })
            .from(budget)
            .where(and(
                eq(budget.type, 'EXPENSE'),
                gte(budget.date, startDateStr!)
            ));

        return [
            { name: 'Jan', revenue: 4000, expenses: 2400 },
            { name: 'Feb', revenue: 3000, expenses: 1398 },
            { name: 'Mar', revenue: 2000, expenses: 9800 },
            { name: 'Apr', revenue: 2780, expenses: 3908 },
            { name: 'May', revenue: 1890, expenses: 4800 },
            { name: 'Current', revenue: currentRevenue?.value || 0, expenses: currentExpense?.value || 0 },
        ];
    })
    .get("/recent-activity", async () => {
        const recentLeads = await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(5);
        const recentEpisodes = await db.select().from(episodes).orderBy(desc(episodes.createdAt)).limit(5);
        return { recentLeads, recentEpisodes };
    });
