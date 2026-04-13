import { describe, it } from "bun:test";
import { Elysia } from "elysia";
import { dashboardRoutes } from "./src/modules/dashboard/dashboard.controller";

describe("Dashboard Controller Benchmark", () => {
    const app = new Elysia().use(dashboardRoutes);

    it("Measure baseline /metrics", async () => {
        // We will use the real database (dev_db in docker) but with tiny data or no data
        const iterations = 50;

        // Warm up
        for (let i = 0; i < 5; i++) {
            await app.handle(new Request("http://localhost/dashboard/metrics"));
        }

        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            const req = new Request("http://localhost/dashboard/metrics");
            await app.handle(req);
        }
        const end = performance.now();
        const duration = end - start;
        console.log(`\n[Optimized] Total time for ${iterations} requests: ${duration.toFixed(2)}ms`);
        console.log(`[Optimized] Average time per request: ${(duration / iterations).toFixed(2)}ms\n`);
    });
});
