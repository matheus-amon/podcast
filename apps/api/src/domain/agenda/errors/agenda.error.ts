/**
 * Domain errors for the agenda module.
 *
 * The use cases threw bare `Error`s, which meant every failure reached the
 * client as a 500 from errorMiddleware's `default` branch — including the ones
 * that are plainly the caller's fault. "Event not found" and "that attendee is
 * already on the list" are 404 and 409, not server errors, and a client cannot
 * tell them apart from a real bug.
 *
 * `status` lives on the error so the HTTP layer stays a translation of the
 * domain rather than the place that decides what a conflict is.
 */

export class AgendaError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string
  ) {
    super(message);
    this.name = 'AgendaError';
  }
}

/** 404 — the event named in the path does not exist (or is soft-deleted). */
export class EventNotFoundError extends AgendaError {
  constructor(eventId: string) {
    super(`Event ${eventId} not found`, 404, 'EVENT_NOT_FOUND');
  }
}

/**
 * 409 — the roster already contains this attendee.
 *
 * This is the bug this class exists for. `AgendaEvent.addAttendee` skips
 * duplicates silently, so adding the same userId twice returned
 * 200 {success: true} while nothing changed: a success response describing a
 * write that never happened, with no error to alert on.
 */
export class DuplicateAttendeeError extends AgendaError {
  constructor(eventId: string, userId: string) {
    super(`User ${userId} is already an attendee of event ${eventId}`, 409, 'DUPLICATE_ATTENDEE');
  }
}

/** 409 — the caller is changing something about a cancelled event. */
export class EventCancelledError extends AgendaError {
  constructor(action: string) {
    super(`Cannot ${action} a cancelled event`, 409, 'EVENT_CANCELLED');
  }
}

/** 404 — removing an attendee who was never on the list. */
export class AttendeeNotFoundError extends AgendaError {
  constructor(userId: string) {
    super(`User ${userId} is not an attendee of this event`, 404, 'ATTENDEE_NOT_FOUND');
  }
}

/** 409 — the attendee is already booked in an overlapping event. */
export class AttendeeTimeConflictError extends AgendaError {
  constructor(userId: string) {
    super(`Time conflict detected for attendee ${userId}`, 409, 'TIME_CONFLICT');
  }
}
