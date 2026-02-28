import dotenv from 'dotenv';

dotenv.config();

interface IAppConfig {
  name: string;
  env: string;
  port: number;
}

interface IDatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
  dialect: string;
}

interface IJwtConfig {
  secret: string;
  expire: string;
  refreshSecret: string;
  refreshExpire: string;
}

interface ICorsConfig {
  origin: string | string[] | boolean;
  credentials: boolean;
}

interface ICookieConfig {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
}

interface IBcryptConfig {
  saltRounds: number;
}

interface IConfig {
  app: IAppConfig;
  database: IDatabaseConfig;
  jwt: IJwtConfig;
  cors: ICorsConfig;
  bcrypt: IBcryptConfig;
  cookie: ICookieConfig;
}

const config: IConfig = {
  // Application settings
  app: {
    name: process.env.APP_NAME || 'Express API',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
  },

  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'express_api_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: process.env.DB_DIALECT || 'mysql',
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expire: process.env.JWT_EXPIRE || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
  },

  // CORS configuration
  cors: {
    origin: (() => {
      const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
      // If wildcard, return true to allow all origins
      if (corsOrigin === '*') {
        return true;
      }
      // If comma-separated, return as array
      if (corsOrigin.includes(',')) {
        return corsOrigin.split(',').map((origin) => origin.trim());
      }
      // Single origin
      return corsOrigin;
    })(),
    credentials: process.env.CORS_ORIGIN !== '*', // Disable credentials if using wildcard
  },

  // Bcrypt configuration
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  },

  // Cookie configuration (for refresh token)
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/api/auth',
  },
};

export default config;
