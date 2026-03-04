/**
 * Refresh Token Repository Port
 * 
 * Interface for refresh token data access
 */

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  usedAt?: Date | null;
  revokedAt?: Date | null;
  createdAt: Date;
}

export interface IRefreshTokenRepository {
  findById(id: string): Promise<RefreshToken | null>;
  findByUserId(userId: string): Promise<RefreshToken[]>;
  create(token: RefreshToken): Promise<RefreshToken>;
  revoke(token: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
  cleanupExpired(): Promise<void>;
}
