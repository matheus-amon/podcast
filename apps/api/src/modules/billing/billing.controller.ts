import { Elysia, t } from "elysia";
import { db } from "../../db";
import { billing, billingStatusEnum } from "../../db/schema";
import { eq, desc, sum, sql } from "drizzle-orm";

// Type helper from enum
type BillingStatus = typeof billingStatusEnum.enumValues[number];

export const billingRoutes = new Elysia({ prefix: "/billing" })
    .get("/", async () => {
        return await db.select().from(billing).orderBy(desc(billing.dueDate));
    })
    .get("/summary", async () => {
        // Calculate totals using a single query with conditional aggregation
        const [result] = await db.select({
            totalBilled: sql<number>`COALESCE(SUM(${billing.amount}), 0)`,
            totalPaid: sql<number>`COALESCE(SUM(CASE WHEN ${billing.status} = 'PAID' THEN ${billing.amount} ELSE 0 END), 0)`,
            totalPending: sql<number>`COALESCE(SUM(CASE WHEN ${billing.status} = 'PENDING' THEN ${billing.amount} ELSE 0 END), 0)`,
            totalOverdue: sql<number>`COALESCE(SUM(CASE WHEN ${billing.status} = 'OVERDUE' THEN ${billing.amount} ELSE 0 END), 0)`,
        }).from(billing);

        return {
            totalBilled: Number(result?.totalBilled) || 0,
            totalPaid: Number(result?.totalPaid) || 0,
            totalPending: Number(result?.totalPending) || 0,
            totalOverdue: Number(result?.totalOverdue) || 0,
        };
    })
    .post("/", async ({ body }) => {
        const [newInvoice] = await db.insert(billing).values({
            ...body,
            dueDate: body.dueDate,
            status: 'PENDING',
        }).returning();
        return newInvoice;
    }, {
        body: t.Object({
            clientName: t.String(),
            amount: t.Number(),
            dueDate: t.String(), // YYYY-MM-DD
            invoiceNumber: t.Optional(t.String()),
            subscriptionPlan: t.Optional(t.String()), // BASIC, PRO, ENTERPRISE
        })
    })
    .put("/:id", async ({ params: { id }, body }) => {
        const [updated] = await db.update(billing)
            .set({
                ...body,
                status: body.status as BillingStatus | undefined,
            })
            .where(eq(billing.id, parseInt(id)))
            .returning();
        return updated;
    }, {
        body: t.Object({
            clientName: t.Optional(t.String()),
            amount: t.Optional(t.Number()),
            dueDate: t.Optional(t.String()),
            status: t.Optional(t.String()), // PAID | PENDING | OVERDUE
            invoiceNumber: t.Optional(t.String()),
            subscriptionPlan: t.Optional(t.String()),
        })
    })
    .delete("/:id", async ({ params: { id } }) => {
        await db.delete(billing).where(eq(billing.id, parseInt(id)));
        return { success: true };
    });
