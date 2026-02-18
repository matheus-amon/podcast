import { Elysia, t } from "elysia";
import { db } from "../../db";
import { billing } from "../../db/schema";
import { eq, desc, sum } from "drizzle-orm";

export const billingRoutes = new Elysia({ prefix: "/billing" })
    .get("/", async () => {
        return await db.select().from(billing).orderBy(desc(billing.dueDate));
    })
    .get("/summary", async () => {
        // Calculate totals
        const totalBilled = await db.select({ value: sum(billing.amount) }).from(billing);
        const totalPaid = await db.select({ value: sum(billing.amount) }).from(billing).where(eq(billing.status, 'PAID'));
        const totalPending = await db.select({ value: sum(billing.amount) }).from(billing).where(eq(billing.status, 'PENDING'));
        const totalOverdue = await db.select({ value: sum(billing.amount) }).from(billing).where(eq(billing.status, 'OVERDUE'));

        return {
            totalBilled: totalBilled[0]?.value || 0,
            totalPaid: totalPaid[0]?.value || 0,
            totalPending: totalPending[0]?.value || 0,
            totalOverdue: totalOverdue[0]?.value || 0,
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
                status: body.status as any,
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
