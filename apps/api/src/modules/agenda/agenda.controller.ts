import { Elysia, t } from "elysia";
import { db } from "../../db";
import { agenda, episodes, scripts, productionTasks } from "../../db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export const agendaRoutes = new Elysia({ prefix: "/agenda" })
    // --- Events (Calendar) ---
    .get("/events", async ({ query }) => {
        const whereClause = [];
        if (query.start) whereClause.push(gte(agenda.startDate, new Date(query.start)));
        if (query.end) whereClause.push(lte(agenda.endDate, new Date(query.end)));

        return await db.select().from(agenda).where(and(...whereClause));
    })
    .post("/events", async ({ body }) => {
        const [newEvent] = await db.insert(agenda).values({
            ...body,
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
            type: body.type as any,
        }).returning();
        return newEvent;
    }, {
        body: t.Object({
            title: t.String(),
            description: t.Optional(t.String()),
            startDate: t.String(),
            endDate: t.String(),
            type: t.Optional(t.String()),
            leadId: t.Optional(t.Number()),
            episodeId: t.Optional(t.Number()),
            participants: t.Optional(t.Array(t.String())),
            color: t.Optional(t.String()),
        })
    })

    // --- Episodes ---
    .get("/episodes", async () => {
        return await db.select().from(episodes).orderBy(desc(episodes.createdAt));
    })
    .get("/episodes/:id", async ({ params: { id } }) => {
        const episode = await db.query.episodes.findFirst({
            where: eq(episodes.id, parseInt(id)),
        });
        if (!episode) throw new Error("Episode not found");
        return episode;
    })
    .post("/episodes", async ({ body }) => {
        const [newEpisode] = await db.insert(episodes).values({
            ...body,
            status: body.status as any,
            publishDate: body.publishDate ? new Date(body.publishDate) : undefined,
        }).returning();
        return newEpisode;
    }, {
        body: t.Object({
            title: t.String(),
            description: t.Optional(t.String()),
            season: t.Optional(t.Number()),
            number: t.Optional(t.Number()),
            status: t.Optional(t.String()),
            publishDate: t.Optional(t.String()),
        })
    })
    .put("/episodes/:id", async ({ params: { id }, body }) => {
        const [updated] = await db.update(episodes)
            .set({
                ...body,
                status: body.status as any,
                publishDate: body.publishDate ? new Date(body.publishDate) : undefined,
            })
            .where(eq(episodes.id, parseInt(id)))
            .returning();
        return updated;
    }, {
        body: t.Object({
            title: t.Optional(t.String()),
            description: t.Optional(t.String()),
            season: t.Optional(t.Number()),
            number: t.Optional(t.Number()),
            status: t.Optional(t.String()),
            publishDate: t.Optional(t.String()),
        })
    })

    // --- Scripts ---
    .get("/episodes/:id/script", async ({ params: { id } }) => {
        const script = await db.query.scripts.findFirst({
            where: eq(scripts.episodeId, parseInt(id)),
            orderBy: desc(scripts.version)
        });
        return script || { content: "" };
    })
    .post("/episodes/:id/script", async ({ params: { id }, body }) => {
        // Simple versioning: always create new or update existing?
        // For POC, let's update or create if not exists
        const existing = await db.query.scripts.findFirst({
            where: eq(scripts.episodeId, parseInt(id))
        });

        if (existing) {
            const [updated] = await db.update(scripts)
                .set({ content: body.content, updatedAt: new Date() })
                .where(eq(scripts.id, existing.id))
                .returning();
            return updated;
        } else {
            const [created] = await db.insert(scripts).values({
                episodeId: parseInt(id),
                content: body.content,
                version: 1
            }).returning();
            return created;
        }
    }, {
        body: t.Object({
            content: t.String(),
        })
    })

    // --- Production Tasks ---
    .get("/episodes/:id/tasks", async ({ params: { id } }) => {
        return await db.select().from(productionTasks)
            .where(eq(productionTasks.episodeId, parseInt(id)));
    })
    .post("/episodes/:id/tasks", async ({ params: { id }, body }) => {
        const [newTask] = await db.insert(productionTasks).values({
            episodeId: parseInt(id),
            title: body.title,
            status: "TODO",
            assignee: body.assignee,
            dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        }).returning();
        return newTask;
    }, {
        body: t.Object({
            title: t.String(),
            assignee: t.Optional(t.String()),
            dueDate: t.Optional(t.String()),
        })
    })
    .put("/tasks/:id", async ({ params: { id }, body }) => {
        const [updated] = await db.update(productionTasks)
            .set({
                status: body.status as any,
            })
            .where(eq(productionTasks.id, parseInt(id)))
            .returning();
        return updated;
    }, {
        body: t.Object({
            status: t.String(),
        })
    });
