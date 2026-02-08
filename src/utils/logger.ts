class Logger {
    // Info log
    static info(message: string, data: any = null): void {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
        if (data) console.log(data);
    }

    // Error log
    static error(message: string, error: any = null): void {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
        if (error) {
            console.error('Error details:', error.message);
            if (process.env.NODE_ENV === 'development') {
                console.error(error.stack);
            }
        }
    }

    // Warning log
    static warn(message: string, data: any = null): void {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
        if (data) console.warn(data);
    }

    // Success log
    static success(message: string, data: any = null): void {
        console.log(`[SUCCESS] ${new Date().toISOString()} - ${message}`);
        if (data) console.log(data);
    }

    // Debug log (only in development)
    static debug(message: string, data: any = null): void {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
            if (data) console.log(data);
        }
    }

    // Request log
    static request(method: string, path: string, ip: string): void {
        console.log(`[REQUEST] ${new Date().toISOString()} - ${method} ${path} from ${ip}`);
    }
}

export default Logger;
