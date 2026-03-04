/**
 * Test Mocks
 * 
 * Mocks reutilizáveis para testes
 * Nota: Usamos vi.fn() do Bun.test, não jest.fn()
 */

import { LeadStatus } from '../../src/domain/leads/value-objects/lead-status.enum';
import { EventType, EventStatus } from '../../src/domain/agenda/value-objects/event-status.enum';

// Helper para criar mock functions (compatível com Bun.test)
function createMockFn(implementation?: (...args: any[]) => any) {
  const mockFn = (...args: any[]) => mockFn._implementation(...args);
  mockFn._implementation = implementation || (() => undefined);
  mockFn.mockResolvedValue = (value: any) => {
    mockFn._implementation = () => Promise.resolve(value);
    return mockFn;
  };
  mockFn.mockReturnValue = (value: any) => {
    mockFn._implementation = () => value;
    return mockFn;
  };
  mockFn.mockResolvedValueOnce = (value: any) => {
    const original = mockFn._implementation;
    mockFn._implementation = (...args: any[]) => {
      mockFn._implementation = original;
      return Promise.resolve(value);
    };
    return mockFn;
  };
  return mockFn;
}

/**
 * Mock para Lead entity
 */
export function createMockLead(overrides?: Partial<any>): any {
  return {
    id: 'test-lead-id',
    name: 'Test Lead',
    email: 'test@example.com',
    phone: '+5511999999999',
    status: LeadStatus.PROSPECT,
    source: 'test',
    assignedTo: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    ...overrides,
  };
}

/**
 * Mock para AgendaEvent entity
 */
export function createMockAgendaEvent(overrides?: Partial<any>): any {
  return {
    id: 'test-event-id',
    title: 'Test Event',
    description: 'Test Description',
    startAt: new Date('2026-03-01T10:00:00Z'),
    endAt: new Date('2026-03-01T11:00:00Z'),
    type: EventType.MEETING,
    status: EventStatus.SCHEDULED,
    attendees: [],
    color: '#3B82F6',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    ...overrides,
  };
}

/**
 * Mock para Budget entity
 */
export function createMockBudget(overrides?: Partial<any>): any {
  return {
    id: 'test-budget-id',
    title: 'Test Budget',
    description: 'Test Description',
    items: [],
    status: 'PLANNED',
    validUntil: new Date('2026-12-31'),
    totalAmount: { cents: 0, currency: 'BRL' },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    ...overrides,
  };
}

/**
 * Mock para LeadRepositoryPort
 */
export function createMockLeadRepository(overrides?: Partial<any>): any {
  return {
    findById: createMockFn().mockResolvedValue(null),
    findByEmail: createMockFn().mockResolvedValue(null),
    findByStatus: createMockFn().mockResolvedValue([]),
    findByAssignedTo: createMockFn().mockResolvedValue([]),
    findAll: createMockFn().mockResolvedValue([]),
    create: createMockFn().mockResolvedValue(undefined),
    update: createMockFn().mockResolvedValue(undefined),
    delete: createMockFn().mockResolvedValue(undefined),
    ...overrides,
  };
}

/**
 * Mock para AgendaRepositoryPort
 */
export function createMockAgendaRepository(overrides?: Partial<any>): any {
  return {
    findById: createMockFn().mockResolvedValue(null),
    findByDateRange: createMockFn().mockResolvedValue([]),
    findByAttendee: createMockFn().mockResolvedValue([]),
    findAll: createMockFn().mockResolvedValue([]),
    create: createMockFn().mockResolvedValue(undefined),
    update: createMockFn().mockResolvedValue(undefined),
    delete: createMockFn().mockResolvedValue(undefined),
    ...overrides,
  };
}

/**
 * Mock para DateRange value object
 */
export function createMockDateRange(start?: Date, end?: Date): any {
  const startDate = start || new Date('2026-03-01T10:00:00Z');
  const endDate = end || new Date('2026-03-01T11:00:00Z');
  
  return {
    start: startDate,
    end: endDate,
    overlaps: createMockFn().mockReturnValue(false),
    duration: createMockFn().mockReturnValue(60),
  };
}

/**
 * Mock para Money value object
 */
export function createMockMoney(amount: number = 10000, currency: string = 'BRL'): any {
  return {
    cents: amount,
    amount: amount / 100,
    currency,
    add: createMockFn().mockReturnValue(createMockMoney(amount)),
    multiply: createMockFn().mockReturnValue(createMockMoney(amount)),
    toString: createMockFn().mockReturnValue(`R$ ${(amount / 100).toFixed(2).replace('.', ',')}`),
  };
}

// Export factory functions para facilitar criação de mocks
export const factories = {
  lead: createMockLead,
  agendaEvent: createMockAgendaEvent,
  budget: createMockBudget,
  leadRepository: createMockLeadRepository,
  agendaRepository: createMockAgendaRepository,
  dateRange: createMockDateRange,
  money: createMockMoney,
};
