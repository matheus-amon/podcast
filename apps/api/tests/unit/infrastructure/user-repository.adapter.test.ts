/**
 * User Repository Adapter Tests
 * 
 * Integration tests for PostgreSQL user repository
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { PostgresUserRepository } from '../../../src/infrastructure/database/adapters/user-repository.adapter';
import { User } from '../../../src/domain/user/entities/user.entity';
import { db } from '../../../src/db';
import { users } from '../../../src/db/schema';

describe('PostgresUserRepository', () => {
  let repository: PostgresUserRepository;

  beforeEach(async () => {
    repository = new PostgresUserRepository();
    // Clean up before each test
    await db.delete(users).where();
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'SecureP@ss123',
        name: 'Test User',
      });

      const created = await repository.create(user);

      expect(created.id).toBe(user.id);
      expect(created.email).toBe(user.email);
      expect(created.name).toBe(user.name);
      expect(created.isActive).toBe(true);
    });

    it('should set createdAt and updatedAt', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'SecureP@ss123',
        name: 'Test User',
      });

      const beforeCreate = Date.now();
      const created = await repository.create(user);
      const afterCreate = Date.now();

      expect(created.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate - 1000);
      expect(created.createdAt.getTime()).toBeLessThanOrEqual(afterCreate + 1000);
      expect(created.updatedAt.getTime()).toBe(created.createdAt.getTime());
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const user = await User.create({
        email: 'find@example.com',
        password: 'SecureP@ss123',
        name: 'Find User',
      });

      await repository.create(user);

      const found = await repository.findByEmail('find@example.com');

      expect(found).toBeDefined();
      expect(found?.email).toBe('find@example.com');
      expect(found?.name).toBe('Find User');
    });

    it('should return null for non-existent email', async () => {
      const found = await repository.findByEmail('nonexistent@example.com');

      expect(found).toBeNull();
    });

    it('should not find deleted user', async () => {
      const user = await User.create({
        email: 'delete@example.com',
        password: 'SecureP@ss123',
        name: 'Delete User',
      });

      await repository.create(user);
      user.softDelete();
      await repository.update(user);

      const found = await repository.findByEmail('delete@example.com');

      expect(found).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const user = await User.create({
        email: 'findid@example.com',
        password: 'SecureP@ss123',
        name: 'Find ID User',
      });

      const created = await repository.create(user);
      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.email).toBe('findid@example.com');
    });

    it('should return null for non-existent id', async () => {
      const found = await repository.findById('00000000-0000-0000-0000-000000000000');

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const user = await User.create({
        email: 'update@example.com',
        password: 'SecureP@ss123',
        name: 'Update User',
      });

      await repository.create(user);

      user.updateLastLogin();

      const updated = await repository.update(user);

      expect(updated.lastLoginAt).toBeDefined();
      expect(updated.updatedAt.getTime()).toBeGreaterThan(user.createdAt.getTime());
    });

    it('should throw error if user not found', async () => {
      const user = await User.create({
        email: 'notfound@example.com',
        password: 'SecureP@ss123',
        name: 'Not Found User',
      });

      // Don't create user in DB, just try to update
      await expect(repository.update(user)).rejects.toThrow('User not found');
    });
  });

  describe('delete', () => {
    it('should soft delete user', async () => {
      const user = await User.create({
        email: 'softdelete@example.com',
        password: 'SecureP@ss123',
        name: 'Soft Delete User',
      });

      const created = await repository.create(user);
      await repository.delete(created.id);

      // After soft delete, user should not be found by ID
      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    it('should not find soft deleted user by email', async () => {
      const user = await User.create({
        email: 'softdelete2@example.com',
        password: 'SecureP@ss123',
        name: 'Soft Delete User 2',
      });

      const created = await repository.create(user);
      await repository.delete(created.id);

      const found = await repository.findByEmail('softdelete2@example.com');
      expect(found).toBeNull();
    });
  });
});
