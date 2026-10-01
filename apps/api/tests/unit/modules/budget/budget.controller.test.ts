/**
 * Budget route parameter validation.
 *
 * These three routes take an `:id` that reaches a Drizzle `eq()` comparison, so
 * a non-numeric value is unvalidated input arriving at the query builder. The
 * `t.Numeric()` param schemas already on main reject it; nothing asserted that,
 * so the guard was one refactor away from being deleted silently.
 *
 * No database and no mocking of the thing under test: the schema rejects the
 * request before the handler ever touches `db`.
 *
 * Adapted from the unmerged fork fix/budget-id-validation, using the `buildApp`
 * factory the rest of the suite uses — annotating a composed app as a bare
 * `Elysia` does not typecheck.
 */

import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { budgetRoutes } from '../../../../src/modules/budget/budget.controller';

/**
 * The composed app keeps a wide generic signature, so it is held as the return
 * type of a builder rather than as a bare `Elysia`: naming it `Elysia` makes
 * every hook on the instance fail to typecheck.
 */
function buildApp() {
  return new Elysia().use(budgetRoutes);
}

describe('budget route param validation', () => {
  describe('rejects a non-numeric :id', () => {
    it('on PUT /budget/:id', async () => {
      const res = await buildApp().handle(
        new Request('http://localhost/budget/abc', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ concept: 'Test' }),
        })
      );

      expect(res.status).toBe(422);
    });

    it('on DELETE /budget/:id', async () => {
      const res = await buildApp().handle(
        new Request('http://localhost/budget/xyz', { method: 'DELETE' })
      );

      expect(res.status).toBe(422);
    });

    it('on POST /budget/templates/:id/apply', async () => {
      const res = await buildApp().handle(
        new Request('http://localhost/budget/templates/not-a-number/apply', { method: 'POST' })
      );

      expect(res.status).toBe(422);
    });

    // The injection-shaped case, which is the reason the guard exists at all.
    it('on a value that looks like SQL injection', async () => {
      const res = await buildApp().handle(
        new Request("http://localhost/budget/1'--", { method: 'DELETE' })
      );

      expect(res.status).toBe(422);
    });
  });

  describe('accepts the id shapes real requests use', () => {
    // Guards against the opposite failure: a validator tightened until it
    // rejects legitimate traffic. `t.Numeric()` coerces, so leading zeros and
    // explicit signs both still work.
    it.each([
      ['a plain integer', '42'],
      ['leading zeros', '007'],
      ['an explicit sign', '-3'],
    ])('%s passes validation and reaches the handler', async (_label, id) => {
      const res = await buildApp().handle(
        new Request(`http://localhost/budget/${id}`, { method: 'DELETE' })
      );

      // Not 422 means validation let it through. Whatever the handler then does
      // without a database is a separate concern, and asserting on it would be
      // asserting on a missing database.
      expect(res.status).not.toBe(422);
    });
  });

  describe('known sharp edge, not a regression', () => {
    // `t.Numeric()` accepts non-integers. Against a Postgres integer column
    // this produces a database error rather than a wrong row, so it is a
    // robustness wart rather than a security hole -- but it is worth writing
    // down, because anyone reading "the id is validated" would assume more than
    // is true. Tightening it is a separate decision; see the PR description.
    it('accepts a decimal id, which the schema does not reject', async () => {
      const res = await buildApp().handle(
        new Request('http://localhost/budget/1.5', { method: 'DELETE' })
      );

      expect(res.status).not.toBe(422);
    });
  });
});
