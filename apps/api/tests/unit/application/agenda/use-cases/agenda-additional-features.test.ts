import { describe, expect, it, mock, beforeEach } from 'bun:test';
import { CompleteEventUseCase } from '@application/agenda/use-cases/complete-event.use-case';
import { AddAttendeeUseCase } from '@application/agenda/use-cases/add-attendee.use-case';
import { RemoveAttendeeUseCase } from '@application/agenda/use-cases/remove-attendee.use-case';
import { AgendaEvent } from '@domain/agenda/entities/agenda-event.entity';
import { EventType, EventStatus } from '@domain/agenda/value-objects/event-status.enum';

describe('Agenda Use Cases - Additional Features', () => {
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findById: mock(async (id: string) => {
        if (id === 'valid-id') {
          return AgendaEvent.create({
            title: 'Test Event',
            startAt: new Date(),
            endAt: new Date(Date.now() + 3600000),
            type: EventType.MEETING,
          });
        }
        if (id === 'cancelled-id') {
          const event = AgendaEvent.create({
             title: 'Cancelled Event',
             startAt: new Date(),
             endAt: new Date(Date.now() + 3600000),
             type: EventType.MEETING,
          });
          event.cancel('No reason');
          return event;
        }
        return null;
      }),
      update: mock(async () => {}),
      create: mock(async () => {}),
      findAll: mock(async () => []),
      findByDateRange: mock(async () => []),
      findByAttendee: mock(async () => []),
      delete: mock(async () => {}),
    };
  });

  describe('CompleteEventUseCase', () => {
    it('should complete an existing event', async () => {
      const useCase = new CompleteEventUseCase(mockRepository);
      await useCase.execute('valid-id');
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('should throw an error if event does not exist', async () => {
      const useCase = new CompleteEventUseCase(mockRepository);
      await expect(useCase.execute('invalid-id')).rejects.toThrow('Event not found');
    });

    it('should throw an error if event is cancelled', async () => {
      const useCase = new CompleteEventUseCase(mockRepository);
      await expect(useCase.execute('cancelled-id')).rejects.toThrow('Cannot complete a cancelled event');
    });
  });

  describe('AddAttendeeUseCase', () => {
    it('should add an attendee to an existing event', async () => {
      const useCase = new AddAttendeeUseCase(mockRepository);
      await useCase.execute('valid-id', 'user-123');
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('should throw an error if event does not exist', async () => {
      const useCase = new AddAttendeeUseCase(mockRepository);
      await expect(useCase.execute('invalid-id', 'user-123')).rejects.toThrow('Event not found');
    });
  });

  describe('RemoveAttendeeUseCase', () => {
    it('should remove an attendee from an existing event', async () => {
      const useCase = new RemoveAttendeeUseCase(mockRepository);
      await useCase.execute('valid-id', 'user-123');
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('should throw an error if event does not exist', async () => {
      const useCase = new RemoveAttendeeUseCase(mockRepository);
      await expect(useCase.execute('invalid-id', 'user-123')).rejects.toThrow('Event not found');
    });
  });
});
