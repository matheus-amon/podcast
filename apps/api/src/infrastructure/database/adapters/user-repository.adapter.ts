/**
 * Postgres User Repository
 *
 * PostgreSQL implementation of User Repository
 */

import { db } from '../../../db';
import { users } from '../../../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { User } from '../../../domain/user/entities/user.entity';
import type { IUserRepository } from '../../../domain/user/ports/user-repository.port';

type DbUser = typeof users.$inferSelect;
/**
 * Insert shape. `users.id` is a plain uuid primary key with no default — the
 * domain generates it and `create` supplies it at the call site — so `id` is
 * omitted here. `createdAt`/`updatedAt` are defaulted and stay optional.
 */
type NewDbUser = Omit<typeof users.$inferInsert, 'id'>;

/**
 * Mapper: Database → Domain
 */
function mapDbToDomain(dbUser: DbUser): User {
  return User.fromProps({
    id: dbUser.id,
    email: dbUser.email,
    passwordHash: dbUser.passwordHash,
    name: dbUser.name,
    avatarUrl: dbUser.avatarUrl,
    isActive: dbUser.isActive,
    emailVerifiedAt: dbUser.emailVerifiedAt ? new Date(dbUser.emailVerifiedAt) : null,
    lastLoginAt: dbUser.lastLoginAt ? new Date(dbUser.lastLoginAt) : null,
    createdAt: dbUser.createdAt ? new Date(dbUser.createdAt) : new Date(),
    updatedAt: dbUser.updatedAt ? new Date(dbUser.updatedAt) : new Date(),
    deletedAt: dbUser.deletedAt ? new Date(dbUser.deletedAt) : null,
  });
}

/**
 * Mapper: Domain → Database
 */
function mapDomainToDb(user: User): NewDbUser {
  return {
    email: user.email,
    passwordHash: user.passwordHash,
    name: user.name,
    avatarUrl: user.avatarUrl ?? null,
    isActive: user.isActive,
    emailVerifiedAt: user.emailVerifiedAt,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
  };
}

export class PostgresUserRepository implements IUserRepository {
  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const result = await db.query.users.findFirst({
      where: and(
        eq(users.id, id),
        isNull(users.deletedAt)
      ),
    });

    if (!result) return null;
    return mapDbToDomain(result);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.query.users.findFirst({
      where: and(
        eq(users.email, email),
        isNull(users.deletedAt)
      ),
    });

    if (!result) return null;
    return mapDbToDomain(result);
  }

  /**
   * Create user
   */
  async create(user: User): Promise<User> {
    const dbData = mapDomainToDb(user);

    const result = await db
      .insert(users)
      .values({
        ...dbData,
        id: user.id, // Explicitly set the ID from the entity
      })
      .returning();

    if (!result[0]) {
      throw new Error('User insert returned no row');
    }

    return mapDbToDomain(result[0]);
  }

  /**
   * Update user
   */
  async update(user: User): Promise<User> {
    const dbData = mapDomainToDb(user);

    const result = await db
      .update(users)
      .set({
        ...dbData,
        updatedAt: new Date(),
      })
      .where(and(
        eq(users.id, user.id),
        isNull(users.deletedAt)
      ))
      .returning();

    if (!result[0]) {
      throw new Error('User not found');
    }

    return mapDbToDomain(result[0]);
  }

  /**
   * Delete user (soft delete)
   */
  async delete(id: string): Promise<void> {
    await db
      .update(users)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }
}
