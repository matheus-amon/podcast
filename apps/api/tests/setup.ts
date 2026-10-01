/**
 * Test Setup File
 * 
 * Configuração global para todos os testes
 * Executado antes de cada suite de testes
 */

import { beforeEach, afterEach } from 'bun:test';

// Allow unit tests to import the db module without a real database.
// If DATABASE_URL is missing we install a dummy value so the import does
// not throw, and mark DB-backed suites to skip (see
// tests/unit/infrastructure/user-repository.adapter.test.ts).
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5432/podcast_saas';
  (process.env as any).__SKIP_DB__ = '1';
}

// Mock console.error para evitar poluição nos testes
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = (...args: any[]) => {
    // Ignorar erros esperados em testes
    if (args[0]?.includes?.('Expected error')) return;
    originalConsoleError(...args);
  };
});

afterEach(() => {
  console.error = originalConsoleError;
});

// Helper para criar datas mockadas
export function mockDate(date: string | Date): void {
  const OriginalDate = global.Date;
  global.Date = class extends OriginalDate {
    constructor(...args: any[]) {
      super(date);
    }
    static override now() {
      return new Date(date).getTime();
    }
  } as any;
}

// Helper para resetar mocks
export function resetMocks(): void {
  // Implementar reset de mocks se necessário
}

// Helper para criar UUIDs mockados
let mockUuidCounter = 0;
export function mockUuid(): string {
  return `mock-uuid-${mockUuidCounter++}`;
}

// Global test utilities
(globalThis as any).testUtils = {
  mockDate,
  resetMocks,
  mockUuid,
};
