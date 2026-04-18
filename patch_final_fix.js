const fs = require('fs');

let code = fs.readFileSync('apps/api/src/modules/agenda/agenda.controller.ts', 'utf-8');

// The issue "Spread types may only be created from object types" happens because we didn't define \`body\` type or params types for \`({ body })\`. Wait, Elysia infers it correctly if we type it properly, but something broke with \`t.Object\` inference.
// Ah, the \`body\` must have a generic or the Elysia import we are using isn't matching up properly with TypeScript's strict mode, or maybe because we use `(id as unknown as string)` which caused issues.

// Actually, let's revert to the original file, and only add the \`params: t.Object({ id: t.Numeric() })\` WITHOUT removing \`parseInt(id)\` and WITHOUT touching anything else. Because \`parseInt\` perfectly handles the string coming from Elysia, and adding \`t.Numeric()\` will perform validation BEFORE the handler is executed (which was the security goal).

code = `import { Elysia, t } from "elysia";
import { db } from "../../db";
import { agenda, episodes, scripts, productionTasks, eventTypeEnum, episodeStatusEnum, taskStatusEnum } from "../../db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

// Type helpers from enum
type EventType = typeof eventTypeEnum.enumValues[number];
type EpisodeStatus = typeof episodeStatusEnum.enumValues[number];
type TaskStatus = typeof taskStatusEnum.enumValues[number];

export const agendaRoutes = new Elysia({ prefix: "/agenda" })
    // --- Events (Calendar) ---
    .get("/events", async ({ query }) => {
        const whereClause = [];
        if (query.start) whereClause.push(gte(agenda.startDate, new Date(query.start as string)));
        if (query.end) whereClause.push(lte(agenda.endDate, new Date(query.end as string)));

        // Fix: Handle empty whereClause to avoid and() failure
        if (whereClause.length === 0) {
            return await db.select().from(agenda);
        }
        return await db.select().from(agenda).where(and(...whereClause));
    })
    .post("/events", async ({ body }) => {
        const [newEvent] = await db.insert(agenda).values({
            ...body,
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
            type: body.type as EventType | undefined,
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
            where: eq(episodes.id, id),
        });
        if (!episode) throw new Error("Episode not found");
        return episode;
    }, {
        params: t.Object({
            id: t.Numeric()
        })
    })
    .post("/episodes", async ({ body }) => {
        const [newEpisode] = await db.insert(episodes).values({
            ...body,
            status: body.status as EpisodeStatus | undefined,
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
                status: body.status as EpisodeStatus | undefined,
                publishDate: body.publishDate ? new Date(body.publishDate) : undefined,
            })
            .where(eq(episodes.id, id))
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
        }),
        params: t.Object({
            id: t.Numeric()
        })
    })

    // --- Scripts ---
    .get("/episodes/:id/script", async ({ params: { id } }) => {
        const script = await db.query.scripts.findFirst({
            where: eq(scripts.episodeId, id),
            orderBy: desc(scripts.version)
        });
        return script || { content: "" };
    }, {
        params: t.Object({
            id: t.Numeric()
        })
    })
    .post("/episodes/:id/script", async ({ params: { id }, body }) => {
        const existing = await db.query.scripts.findFirst({
            where: eq(scripts.episodeId, id)
        });

        if (existing) {
            const [updated] = await db.update(scripts)
                .set({ content: body.content, updatedAt: new Date() })
                .where(eq(scripts.id, existing.id))
                .returning();
            return updated;
        } else {
            const [created] = await db.insert(scripts).values({
                episodeId: id,
                content: body.content,
                version: 1
            }).returning();
            return created;
        }
    }, {
        body: t.Object({
            content: t.String(),
        }),
        params: t.Object({
            id: t.Numeric()
        })
    })

    // --- Production Tasks ---
    .get("/episodes/:id/tasks", async ({ params: { id } }) => {
        return await db.select().from(productionTasks)
            .where(eq(productionTasks.episodeId, id));
    }, {
        params: t.Object({
            id: t.Numeric()
        })
    })
    .post("/episodes/:id/tasks", async ({ params: { id }, body }) => {
        const [newTask] = await db.insert(productionTasks).values({
            episodeId: id,
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
        }),
        params: t.Object({
            id: t.Numeric()
        })
    })
    .put("/tasks/:id", async ({ params: { id }, body }) => {
        const [updated] = await db.update(productionTasks)
            .set({
                status: body.status as TaskStatus | undefined,
            })
            .where(eq(productionTasks.id, id))
            .returning();
        return updated;
    }, {
        body: t.Object({
            status: t.String(),
        }),
        params: t.Object({
            id: t.Numeric()
        })
    });
`;

fs.writeFileSync('apps/api/src/modules/agenda/agenda.controller.ts', code);
