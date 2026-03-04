/**
 * User Entity
 * 
 * Represents a registered user in the system
 */

import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  avatarUrl?: string | null;
  isActive: boolean;
  emailVerifiedAt?: Date | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  avatarUrl?: string;
}

export class User {
  private readonly _props: UserProps;

  private constructor(props: UserProps) {
    this._props = props;
  }

  /**
   * Create a new user
   */
  static async create(dto: CreateUserDTO): Promise<User> {
    // Validate email
    const email = new Email(dto.email);

    // Validate and hash password
    const password = new Password(dto.password);
    const passwordHash = await password.hash();

    // Validate name
    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error('Name is required');
    }

    if (dto.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    if (dto.name.trim().length > 100) {
      throw new Error('Name must be at most 100 characters long');
    }

    const now = new Date();

    return new User({
      id: crypto.randomUUID(),
      email: email.value,
      passwordHash,
      name: dto.name.trim(),
      avatarUrl: dto.avatarUrl ?? null,
      isActive: true,
      emailVerifiedAt: null,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  /**
   * Create user from existing props (from database)
   */
  static fromProps(props: UserProps): User {
    return new User(props);
  }

  /**
   * Get user ID
   */
  get id(): string {
    return this._props.id;
  }

  /**
   * Get user email
   */
  get email(): string {
    return this._props.email;
  }

  /**
   * Get user name
   */
  get name(): string {
    return this._props.name;
  }

  /**
   * Get avatar URL
   */
  get avatarUrl(): string | null {
    return this._props.avatarUrl;
  }

  /**
   * Get password hash (never expose plain password)
   */
  get passwordHash(): string {
    return this._props.passwordHash;
  }

  /**
   * Get active status
   */
  get isActive(): boolean {
    return this._props.isActive;
  }

  /**
   * Get email verification date
   */
  get emailVerifiedAt(): Date | null {
    return this._props.emailVerifiedAt;
  }

  /**
   * Get last login date
   */
  get lastLoginAt(): Date | null {
    return this._props.lastLoginAt;
  }

  /**
   * Get creation date
   */
  get createdAt(): Date {
    return this._props.createdAt;
  }

  /**
   * Get update date
   */
  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  /**
   * Get deletion date
   */
  get deletedAt(): Date | null {
    return this._props.deletedAt;
  }

  /**
   * Update last login timestamp
   */
  updateLastLogin(): void {
    this._props.lastLoginAt = new Date();
    this._props.updatedAt = new Date();
  }

  /**
   * Verify user email
   */
  verifyEmail(): void {
    this._props.emailVerifiedAt = new Date();
    this._props.updatedAt = new Date();
  }

  /**
   * Deactivate user account
   */
  deactivate(): void {
    this._props.isActive = false;
    this._props.updatedAt = new Date();
  }

  /**
   * Activate user account
   */
  activate(): void {
    this._props.isActive = true;
    this._props.updatedAt = new Date();
  }

  /**
   * Soft delete user
   */
  softDelete(): void {
    this._props.deletedAt = new Date();
    this._props.updatedAt = new Date();
  }

  /**
   * Check if user is deleted
   */
  isDeleted(): boolean {
    return this._props.deletedAt !== null;
  }

  /**
   * Convert to plain object (without sensitive data)
   */
  toObject(): Omit<UserProps, 'passwordHash'> {
    const { passwordHash, ...rest } = this._props;
    return { ...rest };
  }
}
