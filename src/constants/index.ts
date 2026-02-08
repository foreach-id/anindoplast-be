export const statusCodes = {
    // Success
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,

    // Client Errors
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,

    // Server Errors
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
} as const;

export const errorCodes = {
    // Authentication Errors (1xxx)
    INVALID_CREDENTIALS: 1001,
    TOKEN_EXPIRED: 1002,
    TOKEN_INVALID: 1003,
    UNAUTHORIZED_ACCESS: 1004,
    ACCOUNT_LOCKED: 1005,

    // User Errors (2xxx)
    USER_NOT_FOUND: 2001,
    USER_ALREADY_EXISTS: 2002,
    INVALID_USER_DATA: 2003,
    EMAIL_NOT_VERIFIED: 2004,

    // Validation Errors (3xxx)
    VALIDATION_ERROR: 3001,
    MISSING_REQUIRED_FIELD: 3002,
    INVALID_EMAIL_FORMAT: 3003,
    WEAK_PASSWORD: 3004,
    PASSWORD_MISMATCH: 3005,

    // Database Errors (4xxx)
    DATABASE_ERROR: 4001,
    QUERY_FAILED: 4002,
    DUPLICATE_ENTRY: 4003,

    // General Errors (5xxx)
    UNKNOWN_ERROR: 5001,
    SERVICE_UNAVAILABLE: 5002,
    RATE_LIMIT_EXCEEDED: 5003
} as const;

export const messages = {
    // Success Messages
    SUCCESS: {
        REGISTRATION: 'User registered successfully',
        LOGIN: 'Login successful',
        LOGOUT: 'Logout successful',
        USER_CREATED: 'User created successfully',
        USER_UPDATED: 'User updated successfully',
        USER_DELETED: 'User deleted successfully',
        USER_RETRIEVED: 'User retrieved successfully',
        USERS_RETRIEVED: 'Users retrieved successfully',
        DATA_RETRIEVED: 'Data retrieved successfully',
        PASSWORD_UPDATED: 'Password updated successfully',
        EMAIL_VERIFIED: 'Email verified successfully'
    },

    // Error Messages
    ERROR: {
        // Authentication
        INVALID_CREDENTIALS: 'Invalid email or password',
        EMAIL_ALREADY_EXISTS: 'Email already exists',
        UNAUTHORIZED: 'Unauthorized access',
        TOKEN_EXPIRED: 'Token has expired, please login again',
        TOKEN_INVALID: 'Invalid or malformed token',
        TOKEN_MISSING: 'No authentication token provided',
        ACCOUNT_LOCKED: 'Your account has been locked',

        // User
        USER_NOT_FOUND: 'User not found',
        INVALID_USER_ID: 'Invalid user ID',

        // Validation
        VALIDATION_FAILED: 'Validation failed',
        WEAK_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
        INVALID_EMAIL: 'Invalid email format',
        PASSWORD_MISMATCH: 'Passwords do not match',
        REQUIRED_FIELD_MISSING: 'Required field is missing',

        // Server
        INTERNAL_SERVER: 'Internal server error occurred',
        DATABASE_ERROR: 'Database operation failed',
        SERVICE_UNAVAILABLE: 'Service temporarily unavailable',

        // General
        NOT_FOUND: 'Resource not found',
        BAD_REQUEST: 'Bad request',
        FORBIDDEN: 'Access forbidden'
    }
} as const;

export const responseTemplates = {
    success: (data: any, message: string) => ({
        success: true,
        message,
        data
    }),
    error: (message: string, errorCode?: number) => ({
        success: false,
        message,
        errorCode
    })
} as const;
