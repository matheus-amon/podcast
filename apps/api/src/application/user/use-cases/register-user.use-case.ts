/**
 * Register User Use Case
 * 
 * Handle user registration
 */

import { User } from '../../../domain/user/entities/user.entity';
import type { IUserRepository } from '../../../domain/user/ports/user-repository.port';
import type { IRefreshTokenRepository } from '../../../domain/user/ports/refresh-token-repository.port';
import { signAccessToken, signRefreshToken } from '../../../lib/jwt';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface RegisterUserDTO {
  email: string;
  password: string;
  name: string;
}

export interface RegisterUserResponse {
  user: ReturnType<User['toObject']>;
  accessToken: string;
  refreshToken: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(dto: RegisterUserDTO): Promise<RegisterUserResponse> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create user
    const user = await User.create(dto);
    
    // Save user
    const savedUser = await this.userRepository.create(user);

    // Generate tokens
    const accessToken = signAccessToken({
      userId: savedUser.id,
      email: savedUser.email,
    });

    const refreshToken = signRefreshToken({
      userId: savedUser.id,
      email: savedUser.email,
    });

    // Persist it. RefreshTokenUseCase looks the token up in the repository
    // before honouring it, so a token that is handed out without a row behind
    // it can never be exchanged.
    await this.refreshTokenRepository.create({
      id: crypto.randomUUID(),
      userId: savedUser.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      usedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    });

    return {
      user: savedUser.toObject(),
      accessToken,
      refreshToken,
    };
  }
}
