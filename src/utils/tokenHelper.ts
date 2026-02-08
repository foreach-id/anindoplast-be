import * as jwt from 'jsonwebtoken';
import config from '@config/index';
import { ITokenPayload } from '@interfaces/index';

class TokenHelper {
    // Generate access token
    static generateAccessToken(payload: ITokenPayload): string {
        return jwt.sign(
            payload,
            config.jwt.secret,
            { expiresIn: config.jwt.expire } as jwt.SignOptions
        );
    }

    // Generate refresh token
    static generateRefreshToken(payload: ITokenPayload): string {
        return jwt.sign(
            payload,
            config.jwt.refreshSecret,
            { expiresIn: config.jwt.refreshExpire } as jwt.SignOptions
        );
    }

    // Verify access token
    static verifyAccessToken(token: string): ITokenPayload {
        try {
            return jwt.verify(token, config.jwt.secret) as ITokenPayload;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    // Verify refresh token
    static verifyRefreshToken(token: string): ITokenPayload {
        try {
            return jwt.verify(token, config.jwt.refreshSecret) as ITokenPayload;
        } catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }

    // Decode token without verification (for debugging)
    static decodeToken(token: string): any {
        return jwt.decode(token);
    }

    // Extract token from header
    static extractTokenFromHeader(authHeader: string | undefined): string | null {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    // Generate token pair (access + refresh)
    static generateTokenPair(payload: ITokenPayload): { accessToken: string; refreshToken: string } {
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);
        return { accessToken, refreshToken };
    }
}

export default TokenHelper;
