/**
 * Refresh Token Use Case
 * 
 * Handle token refresh
 */

import { signAccessToken, signRefreshToken, verifyToken } from '../../../lib/jwt';

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenUseCase {
  async execute(dto: RefreshTokenDTO): Promise<RefreshTokenResponse> {
    // Verify refresh token
    const payload = verifyToken(dto.refreshToken);

    if (!payload || payload.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const accessToken = signAccessToken({
      userId: payload.userId,
      email: payload.email,
    });

    const refreshToken = signRefreshToken({
      userId: payload.userId,
      email: payload.email,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
