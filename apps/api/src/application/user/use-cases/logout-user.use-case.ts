/**
 * Logout User Use Case
 * 
 * Handle user logout
 */

import { IRefreshTokenRepository } from '../../domain/user/ports/refresh-token-repository.port';

export interface LogoutUserDTO {
  userId: string;
  refreshToken?: string;
}

export interface LogoutUserResponse {
  success: boolean;
  message: string;
}

export class LogoutUserUseCase {
  constructor(private readonly refreshTokenRepository: IRefreshTokenRepository) {}

  async execute(dto: LogoutUserDTO): Promise<LogoutUserResponse> {
    try {
      // Revoke the refresh token if provided
      if (dto.refreshToken) {
        await this.refreshTokenRepository.revoke(dto.refreshToken);
      }

      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      // Log error but don't fail logout
      console.error('Logout error:', error);
      
      return {
        success: true,
        message: 'Logout successful',
      };
    }
  }
}
