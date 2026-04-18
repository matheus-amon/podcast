import { describe, expect, it, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import { budgetRoutes } from "../../../../src/modules/budget/budget.controller";

describe("Budget Controller Security Fixes", () => {
    // A mock app to mount the routes
    let app: Elysia<any>;

    beforeEach(() => {
        app = new Elysia().use(budgetRoutes);
    });

    it("should return 422 Unprocessable Content if ID is not numeric on PUT /budget/:id", async () => {
        const response = await app.handle(new Request("http://localhost/budget/abc", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ concept: "Test" })
        }));

        expect(response.status).toBe(422);
    });

    it("should return 422 Unprocessable Content if ID is not numeric on DELETE /budget/:id", async () => {
        const response = await app.handle(new Request("http://localhost/budget/xyz", {
            method: "DELETE"
        }));

        expect(response.status).toBe(422);
    });

    it("should return 422 Unprocessable Content if ID is not numeric on POST /budget/templates/:id/apply", async () => {
        const response = await app.handle(new Request("http://localhost/budget/templates/not-a-number/apply", {
            method: "POST"
        }));

        expect(response.status).toBe(422);
    });
});
