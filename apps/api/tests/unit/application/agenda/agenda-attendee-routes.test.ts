/**
 * The agenda attendee routes, driven through the real controller on a real
 * Elysia app.
 *
 * The behaviour pinned here is the one a client can observe: a duplicate
 * attendee has to come back as 409, not as 200 {success: true} with no write
 * behind it. The handler does no error mapping of its own — the use case
 * throws a domain error and errorMiddleware translates it — so this test also
 * pins that the two are actually wired together. A unit test on the use case
 * alone would pass even if the route were never registered.
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { Elysia } from 'elysia';
import { AgendaController } from '../../../../src/infrastructure/http/adapters/agenda.controller';
import { errorMiddleware } from '../../../../src/middleware/error.middleware';
import { AddAttendeeUseCase } from '../../../../src/application/agenda/use-cases/add-attendee.use-case';
import { RemoveAttendeeUseCase } from '../../../../src/application/agenda/use-cases/remove-attendee.use-case';
import { AgendaEvent } from '../../../../src/domain/agenda/entities/agenda-event.entity';
import { EventStatus, EventType } from '../../../../src/domain/agenda/value-objects/event-status.enum';
import type { AgendaRepositoryPort, DateRange } from '../../../../src/domain/agenda/ports/agenda-repository.port';

const START = new Date('2026-03-01T10:00:00Z');
const END = new Date('2026-03-01T11:00:00Z');

function makeEvent(overrides: Record<string, unknown> = {}): AgendaEvent {
  return AgendaEvent.fromProps({
    id: 'event-1',
    title: 'Recording session',
    description: '',
    startAt: START,
    endAt: END,
    type: EventType.RECORDING as never,
    status: EventStatus.SCHEDULED as never,
    attendees: [],
    color: '#3B82F6',
    createdAt: new Date('2026-02-01T00:00:00Z'),
    updatedAt: new Date('2026-02-01T00:00:00Z'),
    ...overrides,
  });
}

class InMemoryAgendaRepository implements AgendaRepositoryPort {
  readonly events = new Map<string, AgendaEvent>();

  async findById(id: string) {
    return this.events.get(id) ?? null;
  }
  async findByDateRange(_range: DateRange) {
    return [...this.events.values()];
  }
  async findByAttendee(userId: string) {
    return [...this.events.values()].filter((e) => e.attendees.includes(userId));
  }
  async findAll() {
    return [...this.events.values()];
  }
  async create(event: AgendaEvent) {
    this.events.set(event.id, event);
  }
  async update(event: AgendaEvent) {
    this.events.set(event.id, event);
  }
  async delete(id: string) {
    this.events.delete(id);
  }
}

/**
 * The composed app keeps a wide generic signature, so it is held as the return
 * type of a builder rather than as a bare `Elysia`: naming it `Elysia` makes
 * every hook on the instance fail to typecheck.
 */
function buildApp(repository: InMemoryAgendaRepository) {
  const noop = { execute: async () => undefined };
  const controller = new AgendaController(
    noop as never, // create
    noop as never, // update
    noop as never, // cancel
    noop as never, // list
    noop as never, // get
    noop as never, // complete
    new AddAttendeeUseCase(repository),
    new RemoveAttendeeUseCase(repository)
  );

  // errorMiddleware is what turns a domain error into a 4xx. Leaving it out
  // here would make every case below 500, which is the bug.
  return new Elysia()
    .use(errorMiddleware)
    .group('/api', (api) => api.use(controller.routes));
}

async function body<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

interface ErrorBody {
  error: { code: string; message: string };
}

describe('POST /api/agenda/events/:id/attendees', () => {
  let repository: InMemoryAgendaRepository;
  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    repository = new InMemoryAgendaRepository();
    app = buildApp(repository);
  });

  const post = (eventId: string, userId: string) =>
    app.handle(
      new Request(`http://localhost/api/agenda/events/${eventId}/attendees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
    );

  it('adds the attendee and answers 200', async () => {
    await repository.create(makeEvent());

    const res = await post('event-1', 'user-9');

    expect(res.status).toBe(200);
    expect(repository.events.get('event-1')?.attendees).toEqual(['user-9']);
  });

  // The end-to-end version of the silent no-op: 200 with nothing written.
  it('answers 409 when the attendee is already on the list', async () => {
    await repository.create(makeEvent({ attendees: ['user-9'] }));

    const res = await post('event-1', 'user-9');
    const data = await body<ErrorBody>(res);

    expect(res.status).toBe(409);
    expect(data.error.code).toBe('DUPLICATE_ATTENDEE');
  });

  it('answers 404 for an event that does not exist', async () => {
    const res = await post('missing', 'user-9');
    const data = await body<ErrorBody>(res);

    expect(res.status).toBe(404);
    expect(data.error.code).toBe('EVENT_NOT_FOUND');
  });
});

describe('DELETE /api/agenda/events/:id/attendees/:userId', () => {
  let repository: InMemoryAgendaRepository;
  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    repository = new InMemoryAgendaRepository();
    app = buildApp(repository);
  });

  const del = (eventId: string, userId: string) =>
    app.handle(
      new Request(`http://localhost/api/agenda/events/${eventId}/attendees/${userId}`, {
        method: 'DELETE',
      })
    );

  it('removes the attendee and answers 200', async () => {
    await repository.create(makeEvent({ attendees: ['user-1', 'user-2'] }));

    const res = await del('event-1', 'user-1');

    expect(res.status).toBe(200);
    expect(repository.events.get('event-1')?.attendees).toEqual(['user-2']);
  });

  it('answers 404 when the attendee was never on the list', async () => {
    await repository.create(makeEvent({ attendees: ['user-1'] }));

    const res = await del('event-1', 'user-9');
    const data = await body<ErrorBody>(res);

    expect(res.status).toBe(404);
    expect(data.error.code).toBe('ATTENDEE_NOT_FOUND');
  });

  it('answers 404 for an event that does not exist', async () => {
    const res = await del('missing', 'user-9');
    const data = await body<ErrorBody>(res);

    expect(res.status).toBe(404);
    expect(data.error.code).toBe('EVENT_NOT_FOUND');
  });
});
