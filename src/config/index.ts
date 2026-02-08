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
    origin: string;
    credentials: boolean;
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
}

const config: IConfig = {
    // Application settings
    app: {
        name: process.env.APP_NAME || 'Express API',
        env: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '3000', 10)
    },

    // Database configuration
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        name: process.env.DB_NAME || 'express_api_db',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        dialect: process.env.DB_DIALECT || 'mysql'
    },

    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
        expire: process.env.JWT_EXPIRE || '7d',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
        refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d'
    },

    // CORS configuration
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true
    },

    // Bcrypt configuration
    bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10)
    }
};

export default config;
