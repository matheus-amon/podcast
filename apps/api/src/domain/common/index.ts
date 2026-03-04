/**
 * Common Module
 * 
 * Exporta types, entities e ports compartilhados
 */

// Types
export * from './types';

// Entities
export { BaseEntity } from './entities/base.entity';
export type { BaseEntityProps } from './entities/base.entity';

// Value Objects
export { Money } from './value-objects/money.vo';
export type { MoneyProps } from './value-objects/money.vo';

// Ports
export type { IRepository } from './ports/repository.port';
