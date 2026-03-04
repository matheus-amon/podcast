/**
 * Register User Use Case
 * 
 * Handle user registration
 */

import { User } from '../../../domain/user/entities/user.entity';
import { IUserRepository } from '../../../domain/user/ports/user-repository.port';
import { signAccessToken, signRefreshToken } from '../../../lib/jwt';

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
  constructor(private readonly userRepository: IUserRepository) {}

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

    return {
      user: savedUser.toObject(),
      accessToken,
      refreshToken,
    };
  }
}
