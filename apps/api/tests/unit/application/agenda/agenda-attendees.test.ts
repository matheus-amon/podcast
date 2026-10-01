/**
 * Agenda attendee use cases.
 *
 * These drive the real use cases against a real in-memory repository. The bug
 * pinned here is the one that motivated the module's error classes:
 * `AgendaEvent.addAttendee` skips a duplicate userId silently, so adding the
 * same attendee twice used to answer 200 {success: true} while changing
 * nothing — a success response describing a write that never happened.
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { AddAttendeeUseCase } from '../../../../src/application/agenda/use-cases/add-attendee.use-case';
import { RemoveAttendeeUseCase } from '../../../../src/application/agenda/use-cases/remove-attendee.use-case';
import { AgendaEvent } from '../../../../src/domain/agenda/entities/agenda-event.entity';
import { EventStatus, EventType } from '../../../../src/domain/agenda/value-objects/event-status.enum';
import type { AgendaRepositoryPort, DateRange } from '../../../../src/domain/agenda/ports/agenda-repository.port';
import {
  AttendeeNotFoundError,
  AttendeeTimeConflictError,
  DuplicateAttendeeError,
  EventCancelledError,
  EventNotFoundError,
} from '../../../../src/domain/agenda/errors/agenda.error';

const START = new Date('2026-03-01T10:00:00Z');
const END = new Date('2026-03-01T11:00:00Z');

function makeEvent(overrides: Partial<Record<string, unknown>> = {}): AgendaEvent {
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

/**
 * A real repository over real entities. `update` is counted so a test can
 * assert whether a write was attempted at all, which is how the original
 * silent no-op presented: the response said success, so the only way to see it
 * is to check whether anything was persisted.
 */
class InMemoryAgendaRepository implements AgendaRepositoryPort {
  readonly events = new Map<string, AgendaEvent>();
  updateCount = 0;

  async findById(id: string): Promise<AgendaEvent | null> {
    return this.events.get(id) ?? null;
  }

  async findByDateRange(_range: DateRange): Promise<AgendaEvent[]> {
    return [...this.events.values()];
  }

  async findByAttendee(userId: string): Promise<AgendaEvent[]> {
    return [...this.events.values()].filter((event) => event.attendees.includes(userId));
  }

  async findAll(): Promise<AgendaEvent[]> {
    return [...this.events.values()];
  }

  async create(event: AgendaEvent): Promise<void> {
    this.events.set(event.id, event);
  }

  async update(event: AgendaEvent): Promise<void> {
    this.updateCount++;
    this.events.set(event.id, event);
  }

  async delete(id: string): Promise<void> {
    this.events.delete(id);
  }
}

describe('AddAttendeeUseCase', () => {
  let repository: InMemoryAgendaRepository;
  let useCase: AddAttendeeUseCase;

  beforeEach(() => {
    repository = new InMemoryAgendaRepository();
    useCase = new AddAttendeeUseCase(repository);
  });

  it('adds an attendee and persists the event', async () => {
    await repository.create(makeEvent());

    await useCase.execute('event-1', 'user-9');

    expect(repository.events.get('event-1')?.attendees).toEqual(['user-9']);
    expect(repository.updateCount).toBe(1);
  });

  it('adds several distinct attendees', async () => {
    await repository.create(makeEvent());

    await useCase.execute('event-1', 'user-1');
    await useCase.execute('event-1', 'user-2');

    expect(repository.events.get('event-1')?.attendees).toEqual(['user-1', 'user-2']);
  });

  // The regression guard. Before this, the entity skipped the duplicate, the
  // use case returned normally, and the client was told 200 {success: true}.
  it('rejects an attendee who is already on the list instead of silently doing nothing', async () => {
    await repository.create(makeEvent());
    await useCase.execute('event-1', 'user-9');

    expect(useCase.execute('event-1', 'user-9')).rejects.toThrow(DuplicateAttendeeError);
  });

  it('does not persist anything when the attendee is a duplicate', async () => {
    await repository.create(makeEvent());
    await useCase.execute('event-1', 'user-9');
    const updatesBefore = repository.updateCount;

    await useCase.execute('event-1', 'user-9').catch(() => {});

    expect(repository.updateCount).toBe(updatesBefore);
  });

  it('names the offending attendee and event in the duplicate error', async () => {
    await repository.create(makeEvent());
    await useCase.execute('event-1', 'user-9');

    const error = await useCase.execute('event-1', 'user-9').catch((e) => e);

    expect(error).toBeInstanceOf(DuplicateAttendeeError);
    expect((error as Error).message).toContain('user-9');
    expect((error as Error).message).toContain('event-1');
  });

  it('reports a missing event as 404, not a server error', async () => {
    const error = await useCase.execute('nope', 'user-1').catch((e) => e);

    expect(error).toBeInstanceOf(EventNotFoundError);
    expect((error as EventNotFoundError).status).toBe(404);
  });

  it('rejects adding to a cancelled event', async () => {
    await repository.create(makeEvent({ status: EventStatus.CANCELLED }));

    expect(useCase.execute('event-1', 'user-1')).rejects.toThrow(EventCancelledError);
  });

  it('rejects an attendee already booked in an overlapping event', async () => {
    await repository.create(
      makeEvent({ id: 'other', attendees: ['user-1'], startAt: new Date('2026-03-01T10:30:00Z') })
    );
    await repository.create(makeEvent());

    expect(useCase.execute('event-1', 'user-1')).rejects.toThrow(AttendeeTimeConflictError);
  });
});

describe('RemoveAttendeeUseCase', () => {
  let repository: InMemoryAgendaRepository;
  let useCase: RemoveAttendeeUseCase;

  beforeEach(() => {
    repository = new InMemoryAgendaRepository();
    useCase = new RemoveAttendeeUseCase(repository);
  });

  it('removes an attendee and persists the event', async () => {
    await repository.create(makeEvent({ attendees: ['user-1', 'user-2'] }));

    await useCase.execute('event-1', 'user-1');

    expect(repository.events.get('event-1')?.attendees).toEqual(['user-2']);
    expect(repository.updateCount).toBe(1);
  });

  // Same class of bug as the add path: a silent no-op reported as success.
  it('rejects removing an attendee who was never on the list', async () => {
    await repository.create(makeEvent({ attendees: ['user-1'] }));

    expect(useCase.execute('event-1', 'user-9')).rejects.toThrow(AttendeeNotFoundError);
  });

  it('does not persist anything when the attendee is absent', async () => {
    await repository.create(makeEvent({ attendees: ['user-1'] }));
    const updatesBefore = repository.updateCount;

    await useCase.execute('event-1', 'user-9').catch(() => {});

    expect(repository.updateCount).toBe(updatesBefore);
  });

  it('reports a missing event as 404', async () => {
    const error = await useCase.execute('nope', 'user-1').catch((e) => e);

    expect(error).toBeInstanceOf(EventNotFoundError);
    expect((error as EventNotFoundError).status).toBe(404);
  });

  it('rejects removing from a cancelled event', async () => {
    await repository.create(
      makeEvent({ status: EventStatus.CANCELLED, attendees: ['user-1'] })
    );

    expect(useCase.execute('event-1', 'user-1')).rejects.toThrow(EventCancelledError);
  });
});
