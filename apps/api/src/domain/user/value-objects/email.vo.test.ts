/**
 * Email Value Object Tests
 * 
 * Test email validation and normalization
 */

import { describe, it, expect } from 'bun:test';
import { Email } from './email.vo';

describe('Email VO', () => {
  describe('constructor', () => {
    it('should accept valid email', () => {
      const email = new Email('test@example.com');
      expect(email.value).toBe('test@example.com');
    });

    it('should normalize email to lowercase', () => {
      const email = new Email('Test@Example.COM');
      expect(email.value).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const email = new Email('  test@example.com  ');
      expect(email.value).toBe('test@example.com');
    });

    it('should reject invalid email format - missing @', () => {
      expect(() => new Email('invalid.email.com')).toThrow('Invalid email format');
    });

    it('should reject invalid email format - missing domain', () => {
      expect(() => new Email('test@')).toThrow('Invalid email format');
    });

    it('should reject invalid email format - missing local part', () => {
      expect(() => new Email('@example.com')).toThrow('Invalid email format');
    });

    it('should reject empty email', () => {
      expect(() => new Email('')).toThrow('Invalid email format');
    });

    it('should reject email with spaces', () => {
      expect(() => new Email('test @example.com')).toThrow('Invalid email format');
    });

    it('should accept email with subdomain', () => {
      const email = new Email('test@mail.example.com');
      expect(email.value).toBe('test@mail.example.com');
    });

    it('should accept email with plus addressing', () => {
      const email = new Email('test+tag@example.com');
      expect(email.value).toBe('test+tag@example.com');
    });
  });

  describe('equals', () => {
    it('should return true for same email', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return true for case-insensitive comparison', () => {
      const email1 = new Email('Test@Example.com');
      const email2 = new Email('test@example.COM');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('other@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return email value', () => {
      const email = new Email('test@example.com');
      expect(email.toString()).toBe('test@example.com');
    });
  });
});
