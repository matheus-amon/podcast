import { Elysia, t } from "elysia";
import { db } from "../../db";
import { leads, episodes, budget, agenda } from "../../db/schema";
import { sql, desc, count, and, gte, lte, eq } from "drizzle-orm";
import { toIsoDate } from "../../lib/date";

export const dashboardRoutes = new Elysia({ prefix: "/dashboard" })
    .get("/metrics", async () => {
        // 3. Revenue (Current Month) - Use date string for date column comparison
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const startDateStr = toIsoDate(startOfMonth); // YYYY-MM-DD format

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
        const startDateStr = toIsoDate(startOfMonth); // YYYY-MM-DD format

        // Both aggregates are independent, so they run concurrently rather than
        // paying two round-trips back to back. The result arrays are kept whole
        // (rather than destructured to [currentRevenue]) because a bare
        // aggregate always returns one row, and indexing later reads more
        // clearly than unpacking at the await.
        const [revenueResultArray, expenseResultArray] = await Promise.all([
            db.select({ value: sql<number>`sum(${budget.amount})` })
                .from(budget)
                .where(and(
                    eq(budget.type, 'INCOME'),
                    gte(budget.date, startDateStr!)
                )),

            db.select({ value: sql<number>`sum(${budget.amount})` })
                .from(budget)
                .where(and(
                    eq(budget.type, 'EXPENSE'),
                    gte(budget.date, startDateStr!)
                ))
        ]);

        const currentRevenue = revenueResultArray[0];
        const currentExpense = expenseResultArray[0];

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
        // Two independent reads, so concurrent. The shape test in
        // tests/unit/modules/dashboard asserts both keys survive an empty table.
        const [recentLeads, recentEpisodes] = await Promise.all([
            db.select().from(leads).orderBy(desc(leads.createdAt)).limit(5),
            db.select().from(episodes).orderBy(desc(episodes.createdAt)).limit(5)
        ]);

        return { recentLeads, recentEpisodes };
    });
