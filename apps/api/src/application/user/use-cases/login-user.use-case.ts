/**
 * Login User Use Case
 * 
 * Handle user login
 */

import { User } from '../../../domain/user/entities/user.entity';
import type { IUserRepository } from '../../../domain/user/ports/user-repository.port';
import type { IRefreshTokenRepository } from '../../../domain/user/ports/refresh-token-repository.port';
import { signAccessToken, signRefreshToken } from '../../../lib/jwt';
import { comparePassword } from '../../../lib/password';
import { Email } from '../../../domain/user/value-objects/email.vo';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  user: ReturnType<User['toObject']>;
  accessToken: string;
  refreshToken: string;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(dto: LoginUserDTO): Promise<LoginUserResponse> {
    // Validate email format
    try {
      new Email(dto.email);
    } catch {
      throw new Error('Invalid email format');
    }

    // Find user by email
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login (optional - don't fail if this fails)
    try {
      user.updateLastLogin();
      await this.userRepository.update(user);
    } catch (error) {
      // Log error but don't fail the login
      console.error('Failed to update last login:', error);
    }

    // Generate tokens
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Persist it, or RefreshTokenUseCase will not find it when the client
    // tries to exchange it.
    await this.refreshTokenRepository.create({
      id: crypto.randomUUID(),
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      usedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    });

    return {
      user: user.toObject(),
      accessToken,
      refreshToken,
    };
  }
}
