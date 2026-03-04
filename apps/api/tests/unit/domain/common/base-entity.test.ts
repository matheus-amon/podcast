/**
 * Base Entity Tests
 * 
 * Testes para a classe base BaseEntity
 */

import { describe, it, expect } from 'bun:test';
import { BaseEntity } from '../../../../src/domain/common/entities/base.entity';

// Classe concreta para testes
class TestEntity extends BaseEntity<any> {
  public props: any;
  
  constructor(props: any) {
    super(props);
    this.props = props;
  }

  toObject(): any {
    return { ...this.props };
  }
  
  // Expor métodos protegidos para teste
  delete(): void {
    super.delete();
  }
  
  touch(): void {
    super.touch();
  }
  
  get deletedAt() {
    return super.deletedAt;
  }
  
  get updatedAt() {
    return super.updatedAt;
  }
  
  get id() {
    return super.id;
  }
  
  get createdAt() {
    return super.createdAt;
  }
  
  isDeleted(): boolean {
    return super.isDeleted();
  }
}

describe('BaseEntity', () => {
  describe('constructor', () => {
    it('should create entity with basic properties', () => {
      const props = {
        id: 'test-id',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      };

      const entity = new TestEntity(props);

      expect(entity.id).toBe('test-id');
      expect(entity.createdAt).toBe(props.createdAt);
      expect(entity.updatedAt).toBe(props.updatedAt);
    });
  });

  describe('isDeleted', () => {
    it('should return false when deletedAt is undefined', () => {
      const props = {
        id: 'test-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
      };

      const entity = new TestEntity(props);

      expect(entity.isDeleted()).toBe(false);
    });

    it('should return true when deletedAt is set', () => {
      const props = {
        id: 'test-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      };

      const entity = new TestEntity(props);

      expect(entity.isDeleted()).toBe(true);
    });
  });

  describe('touch', () => {
    it('should update updatedAt timestamp', () => {
      const originalDate = new Date('2026-01-01');
      const props = {
        id: 'test-id',
        createdAt: originalDate,
        updatedAt: originalDate,
      };

      const entity = new TestEntity(props);
      
      // Simular passagem de tempo
      const beforeTouch = new Date();
      entity.touch();

      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeTouch.getTime());
    });
  });

  describe('delete', () => {
    it('should set deletedAt timestamp', () => {
      const props = {
        id: 'test-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
      };

      const entity = new TestEntity(props);
      
      const beforeDelete = new Date();
      entity.delete();

      expect(entity.deletedAt).toBeDefined();
      if (entity.deletedAt) {
        expect(entity.deletedAt.getTime()).toBeGreaterThanOrEqual(beforeDelete.getTime());
      }
    });
  });

  describe('toObject', () => {
    it('should return a copy of props', () => {
      const props = {
        id: 'test-id',
        name: 'Test Entity',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const entity = new TestEntity(props);
      const obj = entity.toObject();

      expect(obj).toEqual(props);
      expect(obj).not.toBe(props); // Deve ser uma cópia, não a mesma referência
    });
  });
});
