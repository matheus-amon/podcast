/**
 * Refresh Token Repository Adapter
 *
 * PostgreSQL implementation of IRefreshTokenRepository
 */

import { eq } from 'drizzle-orm';
import { db } from '../../../db';
import { refreshTokens } from '../../../db/schema';
import type { RefreshToken, IRefreshTokenRepository } from '../../domain/user/ports/refresh-token-repository.port';

export class PostgresRefreshTokenRepository implements IRefreshTokenRepository {
  async findById(id: string): Promise<RefreshToken | null> {
    const result = await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.id, id),
    });

    return result ? this.mapToDomain(result) : null;
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const results = await db.query.refreshTokens.findMany({
      where: eq(refreshTokens.userId, userId),
    });

    return results.map((r) => this.mapToDomain(r));
  }

  async create(token: RefreshToken): Promise<RefreshToken> {
    const [created] = await db
      .insert(refreshTokens)
      .values({
        id: token.id,
        userId: token.userId,
        token: token.token,
        expiresAt: token.expiresAt,
        usedAt: token.usedAt,
        revokedAt: token.revokedAt,
      })
      .returning();

    return this.mapToDomain(created);
  }

  async revoke(token: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({
        revokedAt: new Date(),
        usedAt: new Date(),
      })
      .where(eq(refreshTokens.token, token));
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({
        revokedAt: new Date(),
      })
      .where(eq(refreshTokens.userId, userId));
  }

  async cleanupExpired(): Promise<void> {
    await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.expiresAt, new Date()));
  }

  private mapToDomain(row: typeof refreshTokens.$inferSelect): RefreshToken {
    return {
      id: row.id,
      userId: row.userId,
      token: row.token,
      expiresAt: row.expiresAt,
      usedAt: row.usedAt,
      revokedAt: row.revokedAt,
      createdAt: row.createdAt,
    };
  }
}
