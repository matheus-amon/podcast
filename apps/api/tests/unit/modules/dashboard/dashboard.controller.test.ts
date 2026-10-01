/**
 * Dashboard response shape, against a real database.
 *
 * Every dashboard query is a bare aggregate, so each returns exactly one row
 * and the handlers index into a one-element array. That makes a `Promise.all`
 * refactor quietly dangerous: drop one element from the array and the indices
 * shift, so the endpoint returns real numbers from the *wrong query* while
 * still looking healthy, and a test that only checks "is it a number" passes.
 *
 * A real Postgres is used rather than a stubbed `db` because stubbing it would
 * mean asserting on the mock's behaviour. Skipped unless DATABASE_URL points at
 * a database with the schema applied — see the README.
 */

import { describe, it, expect, beforeEach, afterAll } from 'bun:test';
import { Elysia } from 'elysia';
import { db } from '../../../../src/db';
import { leads, episodes, budget } from '../../../../src/db/schema';
import { dashboardRoutes } from '../../../../src/modules/dashboard/dashboard.controller';

const withDatabase = (process.env as { __SKIP_DB__?: string }).__SKIP_DB__ !== '1';

/**
 * The composed app keeps a wide generic signature, so it is held as the return
 * type of a builder rather than as a bare `Elysia`: naming it `Elysia` makes
 * every hook on the instance fail to typecheck.
 */
function buildApp() {
  return new Elysia().use(dashboardRoutes);
}

async function body<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

/** Today's date as YYYY-MM-DD, matching the `budget.date` column type. */
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

describe.skipIf(!withDatabase)('dashboard response shape', () => {
  beforeEach(async () => {
    // Start from empty so the counts are predictable. These are the same tables
    // the user-repository suite truncates; the dashboard suite runs alongside
    // it but never leaves rows behind.
    await db.delete(leads);
    await db.delete(episodes);
    await db.delete(budget);
  });

  afterAll(async () => {
    await db.delete(leads);
    await db.delete(episodes);
    await db.delete(budget);
  });

  describe('GET /dashboard/metrics on an empty database', () => {
    it('returns all four keys', async () => {
      // The regression this file exists for: a Promise.all destructure that
      // loses an element drops a key, and the client renders `undefined` as a
      // real number.
      const res = await buildApp().handle(new Request('http://localhost/dashboard/metrics'));
      const data = await body<Record<string, unknown>>(res);

      expect(Object.keys(data).sort()).toEqual([
        'activeEpisodes',
        'monthlyRevenue',
        'totalLeads',
        'upcomingEvents',
      ]);
    });

    it('returns 0 for every metric, not null and not undefined', async () => {
      // A bare aggregate over zero rows yields one row of NULL. The handler's
      // `|| 0` is what turns that into a number, and this is what proves it.
      const res = await buildApp().handle(new Request('http://localhost/dashboard/metrics'));
      const data = await body<Record<string, number>>(res);

      expect(data).toEqual({
        totalLeads: 0,
        activeEpisodes: 0,
        monthlyRevenue: 0,
        upcomingEvents: 0,
      });
    });

    it('gives every metric a numeric type', async () => {
      const res = await buildApp().handle(new Request('http://localhost/dashboard/metrics'));
      const data = await body<Record<string, number>>(res);

      for (const [key, value] of Object.entries(data)) {
        expect(typeof value, `${key} should be a number`).toBe('number');
      }
    });
  });

  describe('GET /dashboard/metrics with data', () => {
    it('counts leads and excludes published episodes from the active count', async () => {
      await db.insert(leads).values({ name: 'A', email: 'a@example.com' });
      await db.insert(leads).values({ name: 'B', email: 'b@example.com' });
      await db.insert(episodes).values({ title: 'Draft', status: 'EDITING' });
      await db.insert(episodes).values({ title: 'Shipped', status: 'PUBLISHED' });

      const res = await buildApp().handle(new Request('http://localhost/dashboard/metrics'));
      const data = await body<{ totalLeads: number; activeEpisodes: number }>(res);

      expect(data.totalLeads).toBe(2);
      // One unpublished episode. Getting this to 2 would mean the status
      // filter regressed.
      expect(data.activeEpisodes).toBe(1);
    });

    it('sums only INCOME rows in the current month', async () => {
      const today = isoDate(new Date());

      // `category` is notNull with no default, so it has to be supplied.
      await db
        .insert(budget)
        .values({ concept: 'income', type: 'INCOME', amount: 100, category: 'Production', date: today });
      await db
        .insert(budget)
        .values({ concept: 'income2', type: 'INCOME', amount: 250, category: 'Marketing', date: today });
      await db
        .insert(budget)
        .values({ concept: 'expense', type: 'EXPENSE', amount: 999, category: 'Equipment', date: today });

      const res = await buildApp().handle(new Request('http://localhost/dashboard/metrics'));
      const data = await body<{ monthlyRevenue: number }>(res);

      // 350, not 1349. A dropped `eq(budget.type, 'INCOME')` would show the
      // expense too, and the total would still be a perfectly plausible number.
      expect(data.monthlyRevenue).toBe(350);
    });
  });

  describe('GET /dashboard/recent-activity', () => {
    it('returns both keys even with no rows', async () => {
      // Same shape hazard as /metrics: an empty table must not collapse a key.
      const res = await buildApp().handle(
        new Request('http://localhost/dashboard/recent-activity')
      );
      const data = await body<Record<string, unknown>>(res);

      expect(Object.keys(data).sort()).toEqual(['recentEpisodes', 'recentLeads']);
    });

    it('returns the rows it was given, from the right tables', async () => {
      await db.insert(leads).values({ name: 'Only Lead', email: 'only@example.com' });
      await db.insert(episodes).values({ title: 'Only Episode' });

      const res = await buildApp().handle(
        new Request('http://localhost/dashboard/recent-activity')
      );
      const data = await body<{ recentLeads: any[]; recentEpisodes: any[] }>(res);

      expect(data.recentLeads).toHaveLength(1);
      expect(data.recentEpisodes).toHaveLength(1);

      // Key presence alone is not enough. If one element is dropped from a
      // Promise.all the indices shift and the endpoint still returns both keys,
      // both arrays, both of length 1 -- just the same table twice. Asserting
      // on the row content is what catches that; asserting on `Object.keys`
      // alone passed against a deliberately broken handler.
      expect(data.recentLeads[0].name).toBe('Only Lead');
      expect(data.recentEpisodes[0].title).toBe('Only Episode');
    });

    it('keeps the two lists distinct when only one table has rows', async () => {
      await db.insert(leads).values({ name: 'Lead', email: 'lead@example.com' });

      const res = await buildApp().handle(
        new Request('http://localhost/dashboard/recent-activity')
      );
      const data = await body<{ recentLeads: any[]; recentEpisodes: any[] }>(res);

      expect(data.recentLeads).toHaveLength(1);
      expect(data.recentEpisodes).toHaveLength(0);
    });
  });
});
