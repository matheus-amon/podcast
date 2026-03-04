/**
 * User Entity Tests
 * 
 * Test user creation, validation, and business logic
 */

import { describe, it, expect } from 'bun:test';
import { User } from './user.entity';
import { Email } from './value-objects/email.vo';
import { Password } from './value-objects/password.vo';

describe('User Entity', () => {
  const validEmail = 'test@example.com';
  const validPassword = 'SecureP@ss123';
  const validName = 'John Doe';

  describe('create', () => {
    it('should create valid user', async () => {
      const user = await User.create({
        email: validEmail,
        password: validPassword,
        name: validName,
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(validEmail);
      expect(user.name).toBe(validName);
      expect(user.isActive).toBe(true);
      expect(user.passwordHash).toBeDefined();
      expect(user.passwordHash).not.toBe(validPassword);
    });

    it('should normalize email', async () => {
      const user = await User.create({
        email: '  Test@Example.COM  ',
        password: validPassword,
        name: validName,
      });

      expect(user.email).toBe('test@example.com');
    });

    it('should trim name', async () => {
      const user = await User.create({
        email: validEmail,
        password: validPassword,
        name: '  John Doe  ',
      });

      expect(user.name).toBe('John Doe');
    });

    it('should reject invalid email', () => {
      expect(() =>
        User.create({
          email: 'invalid-email',
          password: validPassword,
          name: validName,
        })
      ).toThrow('Invalid email format');
    });

    it('should reject weak password', () => {
      expect(() =>
        User.create({
          email: validEmail,
          password: 'weak',
          name: validName,
        })
      ).toThrow('Password must be at least 8 characters long');
    });

    it('should reject name too short', () => {
      expect(() =>
        User.create({
          email: validEmail,
          password: validPassword,
          name: 'J',
        })
      ).toThrow('Name must be at least 2 characters long');
    });

    it('should reject name too long', () => {
      expect(() =>
        User.create({
          email: validEmail,
          password: validPassword,
          name: 'A'.repeat(101),
        })
      ).toThrow('Name must be at most 100 characters long');
    });

    it('should reject empty name', () => {
      expect(() =>
        User.create({
          email: validEmail,
          password: validPassword,
          name: '',
        })
      ).toThrow('Name is required');
    });

    it('should generate unique id for each user', async () => {
      const user1 = await User.create({
        email: 'user1@example.com',
        password: validPassword,
        name: 'User One',
      });

      const user2 = await User.create({
        email: 'user2@example.com',
        password: validPassword,
        name: 'User Two',
      });

      expect(user1.id).not.toBe(user2.id);
    });

    it('should set createdAt and updatedAt', async () => {
      const now = Date.now();
      const user = await User.create({
        email: validEmail,
        password: validPassword,
        name: validName,
      });

      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(now - 1000);
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(now - 1000);
      expect(user.createdAt.getTime()).toBe(user.updatedAt.getTime());
    });

    it('should set isActive to true by default', async () => {
      const user = await User.create({
        email: validEmail,
        password: validPassword,
        name: validName,
      });

      expect(user.isActive).toBe(true);
    });

    it('should set emailVerifiedAt to null by default', async () => {
      const user = await User.create({
        email: validEmail,
        password: validPassword,
        name: validName,
      });

      expect(user.emailVerifiedAt).toBeNull();
    });

    it('should set lastLoginAt to null by default', async () => {
      const user = await User.create({
        email: validEmail,
        password: validPassword,
        name: validName,
      });

      expect(user.lastLoginAt).toBeNull();
    });
  });

  describe('fromProps', () => {
    it('should create user from existing props', () => {
      const now = new Date();
      const props = {
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        name: 'Test User',
        avatarUrl: null as string | null,
        isActive: true,
        emailVerifiedAt: null as Date | null,
        lastLoginAt: null as Date | null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null as Date | null,
      };

      const user = User.fromProps(props);

      expect(user.id).toBe('test-id');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.isActive).toBe(true);
    });
  });

  describe('updateLastLogin', () => {
    it('should update lastLoginAt', async () => {
      const user = await User.create({
        email: validEmail,
        password: validPassword,
        name: validName,
      });

      const beforeLogin = user.lastLoginAt;
      user.updateLastLogin();
      const afterLogin = user.lastLoginAt;

      expect(beforeLogin).toBeNull();
      expect(afterLogin).toBeDefined();
      expect(afterLogin!.getTime()).toBeGreaterThan(Date.now() - 1000);
    });

    it('should update updatedAt', async () => {
      const user = await User.create({
        email: validEmail,
        password: validPassword,
        name: validName,
      });

      const beforeUpdate = user.updatedAt;
      
      // Wait a bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      user.updateLastLogin();

      expect(user.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
    });
  });

  describe('verifyEmail', () => {
    it('should set emailVerifiedAt', async () => {
      const user = await User.create({
        email: validEmail,
        password: validPassword,
        name: validName,
      });

      expect(user.emailVerifiedAt).toBeNull();

      user.verifyEmail();

      expect(user.emailVerifiedAt).toBeDefined();
      expect(user.emailVerifiedAt!.getTime()).toBeGreaterThan(Date.now() - 1000);
    });
  });

  describe('deactivate', () => {
    it('should set isActive to false', async () => {
      const user = await User.create({
        email: validEmail,
        password: validPassword,
        name: validName,
      });

      expect(user.isActive).toBe(true);

      user.deactivate();

      expect(user.isActive).toBe(false);
    });
  });

  describe('activate', () => {
    it('should set isActive to true', async () => {
      const user = await User.create({
        email: validEmail,
        password: validPassword,
        name: validName,
      });

      user.deactivate();
      expect(user.isActive).toBe(false);

      user.activate();

      expect(user.isActive).toBe(true);
    });
  });

  describe('softDelete', () => {
    it('should set deletedAt', async () => {
      const user = await User.create({
        email: validEmail,
        password: validPassword,
        name: validName,
      });

      expect(user.deletedAt).toBeNull();

      user.softDelete();

      expect(user.deletedAt).toBeDefined();
      expect(user.deletedAt!.getTime()).toBeGreaterThan(Date.now() - 1000);
    });
  });

  describe('isDeleted', () => {
    it('should return true if deletedAt is set', async () => {
      const user = await User.create({
        email: validEmail,
        password: validPassword,
        name: validName,
      });

      expect(user.isDeleted()).toBe(false);

      user.softDelete();

      expect(user.isDeleted()).toBe(true);
    });
  });

  describe('toObject', () => {
    it('should return plain object without passwordHash', async () => {
      const user = await User.create({
        email: validEmail,
        password: validPassword,
        name: validName,
      });

      const obj = user.toObject();

      expect(obj.id).toBe(user.id);
      expect(obj.email).toBe(user.email);
      expect(obj.name).toBe(user.name);
      expect(obj.isActive).toBe(user.isActive);
      expect(obj.passwordHash).toBeUndefined();
    });
  });
});
