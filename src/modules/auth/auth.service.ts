import bcryptjs from 'bcryptjs';
import prisma from '../../config/prisma';
import { LoginDTO } from './auth.types';
import { messages } from '../../constants';
import { TokenHelper } from '../../utils/index';

export class AuthService {

  static async login(data: LoginDTO) {
    // 1. Cari User berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // 2. Cek apakah user ada & password cocok
    if (!user || !(await bcryptjs.compare(data.password, user.password))) {
      throw new Error(messages.ERROR.INVALID_CREDENTIALS);
    }

    // 3. Cek Status Akun (Active/Inactive)
    if (!user.isActive) {
      throw new Error(messages.ERROR.ACCOUNT_LOCKED);
    }

    // 4. Generate Tokens
    const accessToken = TokenHelper.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = TokenHelper.generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // 5. Simpan Refresh Token di DB & Update Last Login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        lastLogin: new Date(),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(token: string) {
    // 1. Verify token signature
    const decoded = TokenHelper.verifyRefreshToken(token);

    // 2. Cari user & cocokan token di database
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.id,
        refreshToken: token,
      },
    });

    if (!user) {
      throw new Error(messages.ERROR.TOKEN_INVALID);
    }

    if (!user.isActive) {
      throw new Error(messages.ERROR.ACCOUNT_LOCKED);
    }

    // 3. Generate token baru
    const newAccessToken = TokenHelper.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = TokenHelper.generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // 4. Update DB dengan token baru
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(userId: number) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return true;
  }
}
