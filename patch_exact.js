const fs = require('fs');

const filePath = 'apps/api/src/modules/agenda/agenda.controller.ts';
let code = fs.readFileSync(filePath, 'utf-8');

// The file was restored, so we are working with the original. Let's do exact replacements.

const replacements = [
  {
    search: `    .get("/episodes/:id", async ({ params: { id } }) => {
        const episode = await db.query.episodes.findFirst({
            where: eq(episodes.id, parseInt(id)),
        });
        if (!episode) throw new Error("Episode not found");
        return episode;
    })`,
    replace: `    .get("/episodes/:id", async ({ params: { id } }) => {
        const episode = await db.query.episodes.findFirst({
            where: eq(episodes.id, id),
        });
        if (!episode) throw new Error("Episode not found");
        return episode;
    }, {
        params: t.Object({
            id: t.Numeric()
        })
    })`
  },
  {
    search: `    .put("/episodes/:id", async ({ params: { id }, body }) => {
        const [updated] = await db.update(episodes)
            .set({
                ...body,
                status: body.status as EpisodeStatus | undefined,
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
    })`,
    replace: `    .put("/episodes/:id", async ({ params: { id }, body }) => {
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
    })`
  },
  {
    search: `    .get("/episodes/:id/script", async ({ params: { id } }) => {
        const script = await db.query.scripts.findFirst({
            where: eq(scripts.episodeId, parseInt(id)),
            orderBy: desc(scripts.version)
        });
        return script || { content: "" };
    })`,
    replace: `    .get("/episodes/:id/script", async ({ params: { id } }) => {
        const script = await db.query.scripts.findFirst({
            where: eq(scripts.episodeId, id),
            orderBy: desc(scripts.version)
        });
        return script || { content: "" };
    }, {
        params: t.Object({
            id: t.Numeric()
        })
    })`
  },
  {
    search: `    .post("/episodes/:id/script", async ({ params: { id }, body }) => {
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
    })`,
    replace: `    .post("/episodes/:id/script", async ({ params: { id }, body }) => {
        // Simple versioning: always create new or update existing?
        // For POC, let's update or create if not exists
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
    })`
  },
  {
    search: `    .get("/episodes/:id/tasks", async ({ params: { id } }) => {
        return await db.select().from(productionTasks)
            .where(eq(productionTasks.episodeId, parseInt(id)));
    })`,
    replace: `    .get("/episodes/:id/tasks", async ({ params: { id } }) => {
        return await db.select().from(productionTasks)
            .where(eq(productionTasks.episodeId, id));
    }, {
        params: t.Object({
            id: t.Numeric()
        })
    })`
  },
  {
    search: `    .post("/episodes/:id/tasks", async ({ params: { id }, body }) => {
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
    })`,
    replace: `    .post("/episodes/:id/tasks", async ({ params: { id }, body }) => {
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
    })`
  },
  {
    search: `    .put("/tasks/:id", async ({ params: { id }, body }) => {
        const [updated] = await db.update(productionTasks)
            .set({
                status: body.status as TaskStatus | undefined,
            })
            .where(eq(productionTasks.id, parseInt(id)))
            .returning();
        return updated;
    }, {
        body: t.Object({
            status: t.String(),
        })
    });`,
    replace: `    .put("/tasks/:id", async ({ params: { id }, body }) => {
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
    });`
  }
];

let i = 0;
for (const rep of replacements) {
  if (code.indexOf(rep.search) === -1) {
    console.error(`Block ${i} not found!`);
  } else {
    code = code.replace(rep.search, rep.replace);
  }
  i++;
}

fs.writeFileSync(filePath, code);
