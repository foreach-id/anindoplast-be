// Extend Express Request to include user property
import { ITokenPayload } from './index';

declare global {
    namespace Express {
        interface Request {
            user?: ITokenPayload;
        }
    }
}

export { };
