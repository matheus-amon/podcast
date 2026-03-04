/**
 * Password Value Object Tests
 * 
 * Test password validation, hashing, and comparison
 */

import { describe, it, expect } from 'bun:test';
import { Password } from './password.vo';

describe('Password VO', () => {
  describe('constructor', () => {
    it('should accept strong password', () => {
      const password = new Password('SecureP@ss123');
      expect(password).toBeDefined();
    });

    it('should reject weak password - too short', () => {
      expect(() => new Password('Short1!')).toThrow('Password must be at least 8 characters long');
    });

    it('should reject weak password - no uppercase', () => {
      expect(() => new Password('lowercase1!')).toThrow('Password must contain at least one uppercase letter');
    });

    it('should reject weak password - no lowercase', () => {
      expect(() => new Password('UPPERCASE1!')).toThrow('Password must contain at least one lowercase letter');
    });

    it('should reject weak password - no number', () => {
      expect(() => new Password('NoNumbers!@#')).toThrow('Password must contain at least one number');
    });

    it('should reject weak password - no special char', () => {
      expect(() => new Password('NoSpecial123')).toThrow('Password must contain at least one special character');
    });

    it('should reject empty password', () => {
      expect(() => new Password('')).toThrow('Password must be at least 8 characters long');
    });
  });

  describe('hash', () => {
    it('should hash password', async () => {
      const password = new Password('SecureP@ss123');
      const hash = await password.hash();
      expect(hash).toBeDefined();
      expect(hash).not.toBe('SecureP@ss123');
    });

    it('should generate different hashes for same password', async () => {
      const password1 = new Password('SecureP@ss123');
      const password2 = new Password('SecureP@ss123');
      
      const hash1 = await password1.hash();
      const hash2 = await password2.hash();
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('should match correct password', async () => {
      const password = new Password('SecureP@ss123');
      const hash = await password.hash();
      
      const isMatch = await password.compare(hash);
      expect(isMatch).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = new Password('SecureP@ss123');
      const hash = await password.hash();
      
      const wrongPassword = new Password('WrongP@ss123');
      const isMatch = await wrongPassword.compare(hash);
      
      expect(isMatch).toBe(false);
    });
  });

  describe('validateStrength', () => {
    it('should return valid for strong password', () => {
      const result = Password.validateStrength('SecureP@ss123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for weak password', () => {
      const result = Password.validateStrength('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
