/**
 * Refresh Token Use Case
 *
 * Handle token refresh with rotation security
 */

import { signAccessToken, signRefreshToken, verifyToken } from '../../../lib/jwt';
import type { IRefreshTokenRepository } from '../../../domain/user/ports/refresh-token-repository.port';

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenUseCase {
  constructor(private readonly refreshTokenRepo: IRefreshTokenRepository) {}

  async execute(dto: RefreshTokenDTO): Promise<RefreshTokenResponse> {
    // Verify refresh token signature
    const payload = verifyToken(dto.refreshToken);

    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }

    // Find the refresh token in repository
    const storedTokens = await this.refreshTokenRepo.findByUserId(payload.userId);
    const tokenRecord = storedTokens.find(t => t.token === dto.refreshToken);

    if (!tokenRecord) {
      throw new Error('Invalid refresh token');
    }

    // Check if token is revoked
    if (tokenRecord.revokedAt) {
      throw new Error('Refresh token revoked');
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      throw new Error('Refresh token expired');
    }

    // Revoke old refresh token (token rotation)
    await this.refreshTokenRepo.revoke(dto.refreshToken);

    // Generate new tokens
    const accessToken = signAccessToken({
      userId: payload.userId,
      email: payload.email,
    });

    const refreshToken = signRefreshToken({
      userId: payload.userId,
      email: payload.email,
    });

    // Store new refresh token
    await this.refreshTokenRepo.create({
      id: crypto.randomUUID(),
      userId: payload.userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      usedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
