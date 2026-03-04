/**
 * Login User Use Case
 * 
 * Handle user login
 */

import { User } from '../../../domain/user/entities/user.entity';
import { IUserRepository } from '../../../domain/user/ports/user-repository.port';
import { signAccessToken, signRefreshToken } from '../../../lib/jwt';
import { comparePassword } from '../../../lib/password';
import { Email } from '../../../domain/user/value-objects/email.vo';

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
  constructor(private readonly userRepository: IUserRepository) {}

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

    // Update last login
    user.updateLastLogin();
    await this.userRepository.update(user);

    // Generate tokens
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: user.toObject(),
      accessToken,
      refreshToken,
    };
  }
}
