import { Elysia, t } from "elysia";
import { db } from "../../db";
import { leads, leadInteractions, roleEnum, leadStatusEnum, leadInteractionTypeEnum } from "../../db/schema";
import { eq, desc } from "drizzle-orm";

// Type helpers from enum
type Role = typeof roleEnum.enumValues[number];
type LeadStatus = typeof leadStatusEnum.enumValues[number];
type LeadInteractionType = typeof leadInteractionTypeEnum.enumValues[number];

export const leadsRoutes = new Elysia({ prefix: "/leads" })
    .get("/", async () => {
        return await db.select().from(leads).orderBy(desc(leads.createdAt));
    })
    .get("/:id", async ({ params: { id } }) => {
        const lead = await db.query.leads.findFirst({
            where: eq(leads.id, parseInt(id)),
        });
        if (!lead) throw new Error("Lead not found");
        return lead;
    })
    .post(
        "/",
        async ({ body }) => {
            const [newLead] = await db.insert(leads).values({
                ...body,
                role: body.role as Role | undefined,
                status: body.status as LeadStatus | undefined,
                tags: body.tags || [],
            }).returning();
            return newLead;
        },
        {
            body: t.Object({
                name: t.String(),
                email: t.String(),
                role: t.Optional(t.String()),
                status: t.Optional(t.String()),
                bio: t.Optional(t.String()),
                linkedinUrl: t.Optional(t.String()),
                company: t.Optional(t.String()),
                position: t.Optional(t.String()),
                avatarUrl: t.Optional(t.String()),
                tags: t.Optional(t.Array(t.String())),
                notes: t.Optional(t.String()),
            }),
        }
    )
    .put(
        "/:id",
        async ({ params: { id }, body }) => {
            const [updatedLead] = await db.update(leads)
                .set({
                    ...body,
                    role: body.role as Role | undefined,
                    status: body.status as LeadStatus | undefined,
                })
                .where(eq(leads.id, parseInt(id)))
                .returning();
            return updatedLead;
        },
        {
            body: t.Object({
                name: t.Optional(t.String()),
                email: t.Optional(t.String()),
                role: t.Optional(t.String()),
                status: t.Optional(t.String()),
                bio: t.Optional(t.String()),
                linkedinUrl: t.Optional(t.String()),
                company: t.Optional(t.String()),
                position: t.Optional(t.String()),
                avatarUrl: t.Optional(t.String()),
                tags: t.Optional(t.Array(t.String())),
                notes: t.Optional(t.String()),
            }),
        }
    )
    .delete("/:id", async ({ params: { id } }) => {
        await db.delete(leads).where(eq(leads.id, parseInt(id)));
        return { success: true };
    })
    // Interactions
    .get("/:id/interactions", async ({ params: { id } }) => {
        return await db.select().from(leadInteractions)
            .where(eq(leadInteractions.leadId, parseInt(id)))
            .orderBy(desc(leadInteractions.date));
    })
    .post(
        "/:id/interactions",
        async ({ params: { id }, body }) => {
            const [newInteraction] = await db.insert(leadInteractions).values({
                leadId: parseInt(id),
                content: body.content,
                type: body.type as LeadInteractionType | undefined,
                date: new Date(),
            }).returning();

            // Update lastContact in leads table
            await db.update(leads)
                .set({ lastContact: new Date() })
                .where(eq(leads.id, parseInt(id)));

            return newInteraction;
        },
        {
            body: t.Object({
                content: t.String(),
                type: t.Optional(t.String()),
            }),
        }
    );
