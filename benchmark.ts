import { $ } from "bun";

async function runBenchmark() {
    console.log("Starting backend server...");

    // Start backend in background
    const serverProc = Bun.spawn(["bun", "run", "src/index.ts"], {
        cwd: "apps/api",
        env: {
            ...process.env,
            DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/podcast_saas",
            JWT_SECRET: "test-secret" // Memory mentioned this is required
        },
        stdout: "ignore",
        stderr: "pipe", // pipe stderr so we can see errors
    });

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
        console.log("\nBenchmarking /api/dashboard/metrics:");
        let totalTimeMetrics = 0;
        const runs = 50;

        for (let i = 0; i < runs; i++) {
            const start = performance.now();
            const res = await fetch("http://localhost:3001/api/dashboard/metrics");
            if (!res.ok) {
                console.error(`Error: ${res.status} ${res.statusText}`);
                const text = await res.text();
                console.error(text);
                break;
            }
            await res.json();
            const end = performance.now();
            totalTimeMetrics += (end - start);
        }
        console.log(`Average time for /api/dashboard/metrics over ${runs} runs: ${(totalTimeMetrics / runs).toFixed(2)} ms`);

        console.log("\nBenchmarking /api/dashboard/charts/revenue:");
        let totalTimeCharts = 0;
        for (let i = 0; i < runs; i++) {
            const start = performance.now();
            const res = await fetch("http://localhost:3001/api/dashboard/charts/revenue");
            await res.json();
            const end = performance.now();
            totalTimeCharts += (end - start);
        }
        console.log(`Average time for /api/dashboard/charts/revenue over ${runs} runs: ${(totalTimeCharts / runs).toFixed(2)} ms`);

        console.log("\nBenchmarking /api/dashboard/recent-activity:");
        let totalTimeRecent = 0;
        for (let i = 0; i < runs; i++) {
            const start = performance.now();
            const res = await fetch("http://localhost:3001/api/dashboard/recent-activity");
            await res.json();
            const end = performance.now();
            totalTimeRecent += (end - start);
        }
        console.log(`Average time for /api/dashboard/recent-activity over ${runs} runs: ${(totalTimeRecent / runs).toFixed(2)} ms`);

    } finally {
        console.log("Stopping server...");
        serverProc.kill();
    }
}

runBenchmark().catch(console.error);