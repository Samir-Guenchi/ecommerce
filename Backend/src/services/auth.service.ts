import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AppDataSource } from '../config/database';
import { User, AccountStatus } from '../entities';
import { emailService } from './email.service';

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    fullName: string | null;
    accountType: string;
    accountStatus: string;
    isAdmin: boolean;
  };
  token: string;
}

export interface VerificationData {
  email: string;
  code: string;
}

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expiresAt: number; userId: number }>();

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Check if user is the first user (admin)
   */
  private async isFirstUser(): Promise<boolean> {
    const userCount = await this.userRepository.count();
    return userCount === 0;
  }

  /**
   * Generate verification code from user info hash
   */
  private generateVerificationCode(userData: { email: string; fullName: string; createdAt: string }): string {
    const dataString = `${userData.email}${userData.fullName}${userData.createdAt}`;
    const hash = crypto.createHash('sha256').update(dataString).digest('hex');
    // Return first 6 digits of hash
    return hash.substring(0, 6).toUpperCase();
  }

  /**
   * Sign up a new user
   */
  async signUp(data: SignUpData): Promise<{ user: User; isAdmin: boolean; needsVerification: boolean }> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Check if this is the first user (admin)
    const isAdmin = await this.isFirstUser();

    // Create user
    const user = this.userRepository.create({
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      accountType: 'buyer', // Default, can be changed later
      accountStatus: isAdmin ? AccountStatus.ACTIVE : AccountStatus.PENDING,
      languagePreference: 'en',
    });

    const savedUser = await this.userRepository.save(user);

    // If admin, no verification needed
    if (isAdmin) {
      return {
        user: savedUser,
        isAdmin: true,
        needsVerification: false,
      };
    }

    // Generate verification code
    const verificationCode = this.generateVerificationCode({
      email: savedUser.email,
      fullName: savedUser.fullName || '',
      createdAt: savedUser.createdAt.toISOString(),
    });

    // Store verification code (expires in 15 minutes)
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    verificationCodes.set(savedUser.email, {
      code: verificationCode,
      expiresAt,
      userId: savedUser.id,
    });

    // Send verification email
    try {
      await emailService.sendVerificationCode(
        savedUser.email,
        verificationCode,
        savedUser.fullName || 'User'
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't throw - user is created, they can request resend
    }

    return {
      user: savedUser,
      isAdmin: false,
      needsVerification: true,
    };
  }

  /**
   * Verify email with code
   */
  async verifyEmail(data: VerificationData): Promise<User> {
    const stored = verificationCodes.get(data.email);

    if (!stored) {
      throw new Error('Verification code not found or expired');
    }

    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(data.email);
      throw new Error('Verification code expired');
    }

    if (stored.code.toUpperCase() !== data.code.toUpperCase()) {
      throw new Error('Invalid verification code');
    }

    // Update user status to active
    const user = await this.userRepository.findOne({
      where: { id: stored.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.accountStatus = AccountStatus.ACTIVE;
    await this.userRepository.save(user);

    // Remove verification code
    verificationCodes.delete(data.email);

    return user;
  }

  /**
   * Resend verification code
   */
  async resendVerificationCode(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.accountStatus === AccountStatus.ACTIVE) {
      throw new Error('Email already verified');
    }

    // Generate new verification code
    const verificationCode = this.generateVerificationCode({
      email: user.email,
      fullName: user.fullName || '',
      createdAt: user.createdAt.toISOString(),
    });

    // Store verification code (expires in 15 minutes)
    const expiresAt = Date.now() + 15 * 60 * 1000;
    verificationCodes.set(user.email, {
      code: verificationCode,
      expiresAt,
      userId: user.id,
    });

    // Send verification email
    await emailService.sendVerificationCode(
      user.email,
      verificationCode,
      user.fullName || 'User'
    );
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    // Find user
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Check if account is active (admin is always active)
    const isAdmin = await this.isAdmin(user.id);
    if (!isAdmin && user.accountStatus !== AccountStatus.ACTIVE) {
      throw new Error('Account not verified. Please verify your email first.');
    }

    // Update last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        accountType: user.accountType,
        accountStatus: user.accountStatus,
        isAdmin,
      },
      token,
    };
  }

  /**
   * Check if user is admin (first user)
   */
  async isAdmin(userId: number): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    // Check if this is the first user
    const firstUser = await this.userRepository.findOne({
      where: {},
      order: { id: 'ASC' },
    });

    return firstUser?.id === user.id;
  }

  /**
   * Generate JWT token
   */
  generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      accountType: user.accountType,
      accountStatus: user.accountStatus,
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

export const authService = new AuthService();

