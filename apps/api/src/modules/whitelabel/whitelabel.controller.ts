import { Elysia, t } from "elysia";
import { db } from "../../db";
import { whitelabelConfig } from "../../db/schema";
import { eq } from "drizzle-orm";

export const whitelabelRoutes = new Elysia({ prefix: "/whitelabel" })
    .get("/config", async () => {
        const [config] = await db.select().from(whitelabelConfig).limit(1);
        if (!config) {
            return {
                logoUrl: null,
                primaryColor: '#3B82F6',
                secondaryColor: '#1E40AF',
                companyName: 'Podcast SaaS'
            }
        }
        return config;
    })
    .post(
        "/config",
        async ({ body }) => {
            // Simplification: just updates the first row or inserts if not exists
            // checking if exists
            const [exists] = await db.select().from(whitelabelConfig).limit(1);

            if (exists) {
                const [updated] = await db.update(whitelabelConfig)
                    .set(body)
                    .where(eq(whitelabelConfig.id, exists.id))
                    .returning();
                return updated;
            } else {
                const [inserted] = await db.insert(whitelabelConfig).values(body).returning();
                return inserted;
            }
        },
        {
            body: t.Object({
                logoUrl: t.Optional(t.String()),
                primaryColor: t.Optional(t.String()),
                secondaryColor: t.Optional(t.String()),
                companyName: t.Optional(t.String()),
            })
        }
    );
