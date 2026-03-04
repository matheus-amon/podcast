/**
 * Shared Types
 * 
 * Types compartilhados entre domain, application e infrastructure
 */

/**
 * Base interface para todas as entities
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Resultado paginado para queries
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Filtros base para queries
 */
export interface BaseFilters {
  offset?: number;
  limit?: number;
}

/**
 * Tipo para operações de CRUD
 */
export interface CrudRepository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(filters?: BaseFilters): Promise<T[]>;
  create(entity: T): Promise<void>;
  update(entity: T): Promise<void>;
  delete(id: ID): Promise<void>;
}

/**
 * Tipo para value objects com validação
 */
export interface ValueObject<T> {
  value: T;
  isValid(): boolean;
  equals(other: ValueObject<T>): boolean;
  toString(): string;
}

/**
 * Tipo para erros de domínio
 */
export class DomainError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

/**
 * Tipo para resultados de validação
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Helper para criar resultado de validação
 */
export function createValidationResult(isValid: boolean, errors: string[] = []): ValidationResult {
  return { isValid, errors };
}

/**
 * Tipo para operações que podem falhar
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Helper para criar resultado de sucesso
 */
export function success<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * Helper para criar resultado de erro
 */
export function error<E>(error: E): Result<never, E> {
  return { success: false, error };
}
