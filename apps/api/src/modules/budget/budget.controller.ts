import { Elysia, t } from "elysia";
import { db } from "../../db";
import { budget, budgetTemplates, budgetTypeEnum, budgetStatusEnum } from "../../db/schema";
import { eq, desc, sum, sql } from "drizzle-orm";

// Type helpers from enum
type BudgetType = typeof budgetTypeEnum.enumValues[number];
type BudgetStatus = typeof budgetStatusEnum.enumValues[number];

export const budgetRoutes = new Elysia({ prefix: "/budget" })
    .get("/", async () => {
        return await db.select().from(budget).orderBy(desc(budget.date));
    })
    .get("/summary", async () => {
        // Calculate totals efficiently in a single query
        const totals = await db.select({
            income: sql<number>`COALESCE(SUM(CASE WHEN ${budget.type} = 'INCOME' THEN ${budget.amount} ELSE 0 END), 0)`,
            expense: sql<number>`COALESCE(SUM(CASE WHEN ${budget.type} = 'EXPENSE' THEN ${budget.amount} ELSE 0 END), 0)`,
        }).from(budget);

        // Safely extract the calculated values and ensure they are numbers
        const incomeValue = totals[0]?.income ? Number(totals[0].income) : 0;
        const expenseValue = totals[0]?.expense ? Number(totals[0].expense) : 0;

        return {
            totalIncome: incomeValue,
            totalExpense: expenseValue,
            balance: incomeValue - expenseValue
        };
    })
    .post("/", async ({ body }) => {
        const [newEntry] = await db.insert(budget).values({
            ...body,
            date: body.date ? body.date : new Date().toISOString().split('T')[0], // YYYY-MM-DD
            type: body.type as BudgetType | undefined,
            status: body.status as BudgetStatus | undefined,
        }).returning();
        return newEntry;
    }, {
        body: t.Object({
            concept: t.String(),
            amount: t.Number(),
            type: t.String(), // INCOME | EXPENSE
            category: t.String(),
            date: t.Optional(t.String()),
            responsible: t.Optional(t.String()),
            status: t.Optional(t.String()), // PLANNED | APPROVED | PAID | PENDING
            connectedEpisodeId: t.Optional(t.Number()),
        })
    })
    .put("/:id", async ({ params: { id }, body }) => {
        const [updated] = await db.update(budget)
            .set({
                ...body,
                type: body.type as BudgetType | undefined,
                status: body.status as BudgetStatus | undefined,
            })
            .where(eq(budget.id, parseInt(id)))
            .returning();
        return updated;
    }, {
        body: t.Object({
            concept: t.Optional(t.String()),
            amount: t.Optional(t.Number()),
            type: t.Optional(t.String()),
            category: t.Optional(t.String()),
            date: t.Optional(t.String()),
            responsible: t.Optional(t.String()),
            status: t.Optional(t.String()),
        })
    })
    .delete("/:id", async ({ params: { id } }) => {
        await db.delete(budget).where(eq(budget.id, parseInt(id)));
        return { success: true };
    })

    // --- TEMPLATES ---
    .get("/templates", async () => {
        return await db.select().from(budgetTemplates).orderBy(desc(budgetTemplates.createdAt));
    })
    .post("/templates", async ({ body }) => {
        const [newTemplate] = await db.insert(budgetTemplates).values({
            name: body.name,
            items: body.items,
        }).returning();
        return newTemplate;
    }, {
        body: t.Object({
            name: t.String(),
            items: t.Array(t.Object({
                concept: t.String(),
                amount: t.Number(),
                type: t.String(), // INCOME | EXPENSE
                category: t.String(),
            }))
        })
    })
    .post("/templates/:id/apply", async ({ params: { id } }) => {
        const template = await db.query.budgetTemplates.findFirst({
            where: eq(budgetTemplates.id, parseInt(id))
        });

        if (!template || !template.items) throw new Error("Template not found or empty");

        if (template.items.length === 0) {
            return [];
        }

        const currentDate = new Date().toISOString().split('T')[0];
        const newItems = template.items.map(item => ({
            ...item,
            type: item.type as BudgetType | undefined,
            status: 'PLANNED' as BudgetStatus, // Default status for applied templates
            date: currentDate,
        }));

        const createdItems = await db.insert(budget).values(newItems).returning();
        return createdItems;
    });
