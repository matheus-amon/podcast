/**
 * AgendaEvent Entity Tests
 * 
 * Testes TDD para a entity AgendaEvent
 * Escrever testes PRIMEIRO, depois implementar
 */

import { describe, it, expect } from 'bun:test';
import { AgendaEvent } from '../../../../src/domain/agenda/entities/agenda-event.entity';
import { EventType, EventStatus } from '../../../../src/domain/agenda/value-objects/event-status.enum';

describe('AgendaEvent', () => {
  describe('create', () => {
    it('should create valid agenda event when data is valid', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');

      const event = AgendaEvent.create({
        title: 'Recording Session',
        description: 'Podcast episode recording',
        startAt,
        endAt,
        type: EventType.RECORDING,
      });

      expect(event).toBeDefined();
      expect(event.title).toBe('Recording Session');
      expect(event.startAt).toBe(startAt);
      expect(event.endAt).toBe(endAt);
      expect(event.type).toBe(EventType.RECORDING);
      expect(event.status).toBe(EventStatus.SCHEDULED);
    });

    it('should throw error when end is before start', () => {
      const startAt = new Date('2026-03-01T11:00:00Z');
      const endAt = new Date('2026-03-01T10:00:00Z');

      expect(() => {
        AgendaEvent.create({
          title: 'Invalid Event',
          startAt,
          endAt,
          type: EventType.MEETING,
        });
      }).toThrow('End date must be after start date');
    });

    it('should throw error when title is empty', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');

      expect(() => {
        AgendaEvent.create({
          title: '',
          startAt,
          endAt,
          type: EventType.MEETING,
        });
      }).toThrow('Title is required');
    });

    it('should generate unique id for each event', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');

      const event1 = AgendaEvent.create({
        title: 'Event 1',
        startAt,
        endAt,
        type: EventType.MEETING,
      });

      const event2 = AgendaEvent.create({
        title: 'Event 2',
        startAt,
        endAt,
        type: EventType.MEETING,
      });

      expect(event1.id).not.toBe(event2.id);
    });
  });

  describe('cancel', () => {
    it('should change status to CANCELLED', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');

      const event = AgendaEvent.create({
        title: 'Meeting',
        startAt,
        endAt,
        type: EventType.MEETING,
      });

      expect(event.status).toBe(EventStatus.SCHEDULED);

      event.cancel('Conflict with another meeting');

      expect(event.status).toBe(EventStatus.CANCELLED);
    });

    it('should update updatedAt timestamp', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');

      const event = AgendaEvent.create({
        title: 'Meeting',
        startAt,
        endAt,
        type: EventType.MEETING,
      });

      const beforeCancel = event.updatedAt;

      // Aguardar 1ms para garantir diferença de tempo
      const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      wait(1).then(() => {
        event.cancel('Conflict');
        expect(event.updatedAt.getTime()).toBeGreaterThan(beforeCancel.getTime());
      });
    });
  });

  describe('markAsCompleted', () => {
    it('should change status to COMPLETED', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');

      const event = AgendaEvent.create({
        title: 'Recording',
        startAt,
        endAt,
        type: EventType.RECORDING,
      });

      event.markAsCompleted();

      expect(event.status).toBe(EventStatus.COMPLETED);
    });
  });

  describe('reschedule', () => {
    it('should update startAt and endAt', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');
      const newStart = new Date('2026-03-02T14:00:00Z');
      const newEnd = new Date('2026-03-02T15:00:00Z');

      const event = AgendaEvent.create({
        title: 'Meeting',
        startAt,
        endAt,
        type: EventType.MEETING,
      });

      event.reschedule(newStart, newEnd);

      expect(event.startAt).toBe(newStart);
      expect(event.endAt).toBe(newEnd);
    });

    it('should throw error when new end is before new start', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');
      const newStart = new Date('2026-03-02T14:00:00Z');
      const newEnd = new Date('2026-03-02T13:00:00Z');

      const event = AgendaEvent.create({
        title: 'Meeting',
        startAt,
        endAt,
        type: EventType.MEETING,
      });

      expect(() => {
        event.reschedule(newStart, newEnd);
      }).toThrow('End date must be after start date');
    });
  });

  describe('addAttendee', () => {
    it('should add attendee to list', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');

      const event = AgendaEvent.create({
        title: 'Meeting',
        startAt,
        endAt,
        type: EventType.MEETING,
      });

      event.addAttendee('user-1');
      event.addAttendee('user-2');

      expect(event.attendees).toHaveLength(2);
      expect(event.attendees).toContain('user-1');
      expect(event.attendees).toContain('user-2');
    });

    it('should not add duplicate attendee', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');

      const event = AgendaEvent.create({
        title: 'Meeting',
        startAt,
        endAt,
        type: EventType.MEETING,
      });

      event.addAttendee('user-1');
      event.addAttendee('user-1');

      expect(event.attendees).toHaveLength(1);
    });
  });

  describe('removeAttendee', () => {
    it('should remove attendee from list', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');

      const event = AgendaEvent.create({
        title: 'Meeting',
        startAt,
        endAt,
        type: EventType.MEETING,
      });

      event.addAttendee('user-1');
      event.addAttendee('user-2');

      event.removeAttendee('user-1');

      expect(event.attendees).toHaveLength(1);
      expect(event.attendees).not.toContain('user-1');
      expect(event.attendees).toContain('user-2');
    });
  });

  describe('overlapsWith', () => {
    it('should return true when events overlap', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');
      const overlapStart = new Date('2026-03-01T10:30:00Z');
      const overlapEnd = new Date('2026-03-01T11:30:00Z');

      const event1 = AgendaEvent.create({
        title: 'Event 1',
        startAt,
        endAt,
        type: EventType.MEETING,
      });

      const event2 = AgendaEvent.create({
        title: 'Event 2',
        startAt: overlapStart,
        endAt: overlapEnd,
        type: EventType.MEETING,
      });

      expect(event1.overlapsWith(event2)).toBe(true);
    });

    it('should return false when events do not overlap', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');
      const afterStart = new Date('2026-03-01T11:30:00Z');
      const afterEnd = new Date('2026-03-01T12:30:00Z');

      const event1 = AgendaEvent.create({
        title: 'Event 1',
        startAt,
        endAt,
        type: EventType.MEETING,
      });

      const event2 = AgendaEvent.create({
        title: 'Event 2',
        startAt: afterStart,
        endAt: afterEnd,
        type: EventType.MEETING,
      });

      expect(event1.overlapsWith(event2)).toBe(false);
    });
  });

  describe('duration', () => {
    it('should return duration in minutes', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:30:00Z');

      const event = AgendaEvent.create({
        title: 'Meeting',
        startAt,
        endAt,
        type: EventType.MEETING,
      });

      expect(event.duration()).toBe(90);
    });
  });

  describe('updateTitle', () => {
    it('should update title', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');

      const event = AgendaEvent.create({
        title: 'Old Title',
        startAt,
        endAt,
        type: EventType.MEETING,
      });

      event.updateTitle('New Title');

      expect(event.title).toBe('New Title');
    });

    it('should throw error when title is empty', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');

      const event = AgendaEvent.create({
        title: 'Title',
        startAt,
        endAt,
        type: EventType.MEETING,
      });

      expect(() => {
        event.updateTitle('');
      }).toThrow('Title is required');
    });
  });

  describe('updateDescription', () => {
    it('should update description', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');

      const event = AgendaEvent.create({
        title: 'Meeting',
        description: 'Old description',
        startAt,
        endAt,
        type: EventType.MEETING,
      });

      event.updateDescription('New description');

      expect(event.description).toBe('New description');
    });
  });

  describe('isScheduled', () => {
    it('should return true when event is scheduled', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');

      const event = AgendaEvent.create({
        title: 'Meeting',
        startAt,
        endAt,
        type: EventType.MEETING,
      });

      expect(event.isScheduled()).toBe(true);
    });
  });

  describe('isInProgress', () => {
    it('should return true when event is in progress', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');

      const event = AgendaEvent.fromProps({
        id: 'test-id',
        title: 'Meeting',
        startAt,
        endAt,
        type: EventType.MEETING,
        status: EventStatus.IN_PROGRESS,
        attendees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(event.isInProgress()).toBe(true);
    });
  });

  describe('isCompleted', () => {
    it('should return true when event is completed', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');

      const event = AgendaEvent.fromProps({
        id: 'test-id',
        title: 'Meeting',
        startAt,
        endAt,
        type: EventType.MEETING,
        status: EventStatus.COMPLETED,
        attendees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(event.isCompleted()).toBe(true);
    });
  });

  describe('isCancelled', () => {
    it('should return true when event is cancelled', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');

      const event = AgendaEvent.fromProps({
        id: 'test-id',
        title: 'Meeting',
        startAt,
        endAt,
        type: EventType.MEETING,
        status: EventStatus.CANCELLED,
        attendees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(event.isCancelled()).toBe(true);
    });
  });

  describe('toObject', () => {
    it('should return a copy of props', () => {
      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');

      const event = AgendaEvent.create({
        title: 'Meeting',
        startAt,
        endAt,
        type: EventType.MEETING,
      });

      const obj = event.toObject();

      expect(obj).toBeDefined();
      expect(obj.id).toBe(event.id);
      expect(obj.title).toBe(event.title);
      expect(obj).not.toBe(event.props);
    });
  });
});
