/**
 * errorMiddleware against the real Elysia app, with real thrown errors.
 *
 * The case that matters: a domain error carrying its own status must reach the
 * client as that status, not as the generic 500. Everything else here is the
 * blast radius of that one behaviour.
 */

import { describe, it, expect } from 'bun:test';
import { Elysia, t } from 'elysia';
import { errorMiddleware } from '../../../src/middleware/error.middleware';
import {
  AttendeeNotFoundError,
  DuplicateAttendeeError,
  EventNotFoundError,
} from '../../../src/domain/agenda/errors/agenda.error';

/**
 * A composed app keeps a wide generic signature, so it is held as the return
 * type of a builder rather than as a bare `Elysia`: naming it `Elysia` makes
 * every hook on the instance fail to typecheck.
 */
function buildApp() {
  return new Elysia()
    .use(errorMiddleware)
    .get('/domain-error', () => {
      throw new EventNotFoundError('event-1');
    })
    .get('/conflict', () => {
      throw new DuplicateAttendeeError('event-1', 'user-9');
    })
    .get('/absent-attendee', () => {
      throw new AttendeeNotFoundError('user-9');
    })
    .get('/plain-error', () => {
      throw new Error('something broke');
    })
    .get('/non-error', () => {
      throw 'a bare string';
    })
    .post('/validated', () => ({ ok: true }), {
      body: t.Object({ email: t.String({ format: 'email' }) }),
    });
}

const app = buildApp();

async function body<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

interface ErrorBody {
  error: { code: string; message: string };
}

describe('errorMiddleware', () => {
  describe('domain errors', () => {
    it('returns the status the error carries rather than a 500', async () => {
      const res = await app.handle(new Request('http://localhost/domain-error'));

      expect(res.status).toBe(404);
    });

    it('returns the domain error code to the client', async () => {
      const res = await app.handle(new Request('http://localhost/domain-error'));
      const data = await body<ErrorBody>(res);

      expect(data.error.code).toBe('EVENT_NOT_FOUND');
      expect(data.error.message).toContain('event-1');
    });

    it('maps a duplicate attendee to 409, not 500', async () => {
      // This is the regression the whole change exists for: a duplicate used
      // to be indistinguishable from a genuine server fault.
      const res = await app.handle(new Request('http://localhost/conflict'));
      const data = await body<ErrorBody>(res);

      expect(res.status).toBe(409);
      expect(data.error.code).toBe('DUPLICATE_ATTENDEE');
    });

    it('maps an absent attendee to 404', async () => {
      const res = await app.handle(new Request('http://localhost/absent-attendee'));
      const data = await body<ErrorBody>(res);

      expect(res.status).toBe(404);
      expect(data.error.code).toBe('ATTENDEE_NOT_FOUND');
    });
  });

  describe('unrelated failures are unchanged', () => {
    it('still returns 500 for a plain Error', async () => {
      const res = await app.handle(new Request('http://localhost/plain-error'));
      const data = await body<ErrorBody>(res);

      expect(res.status).toBe(500);
      expect(data.error.code).toBe('UNKNOWN_ERROR');
    });

    it('still returns 400 for a validation failure', async () => {
      const res = await app.handle(
        new Request('http://localhost/validated', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'not-an-email' }),
        })
      );
      const data = await body<ErrorBody>(res);

      expect(res.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('does not leak a stack trace in the response', async () => {
      const res = await app.handle(new Request('http://localhost/plain-error'));
      const text = await res.text();

      expect(text).not.toContain('at <anonymous>');
      expect(text).not.toContain('.ts:');
    });
  });
});
