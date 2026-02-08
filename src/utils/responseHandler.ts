import { Response } from 'express';
import { statusCodes, messages } from '@constants/index';

interface ISuccessResponse {
    success: true;
    message: string;
    data: any;
}

interface IErrorResponse {
    success: false;
    message: string;
    errorCode?: number;
    statusCode: number;
    errors?: any;
}

interface IPaginatedResponse {
    success: true;
    message: string;
    data: any;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

class ResponseHandler {
    // Success response
    static success(
        res: Response,
        data: any,
        message: string = messages.SUCCESS.DATA_RETRIEVED,
        statusCode: number = statusCodes.OK
    ): Response {
        const response: ISuccessResponse = {
            success: true,
            message,
            data
        };
        return res.status(statusCode).json(response);
    }

    // Created response
    static created(
        res: Response,
        data: any,
        message: string = messages.SUCCESS.USER_CREATED
    ): Response {
        return this.success(res, data, message, statusCodes.CREATED);
    }

    // Error response
    static error(
        res: Response,
        message: string,
        errorCode?: number,
        statusCode: number = statusCodes.INTERNAL_SERVER_ERROR,
        errors: any = null
    ): Response {
        const response: IErrorResponse = {
            success: false,
            message,
            errorCode,
            statusCode,
            ...(errors && { errors })
        };
        return res.status(statusCode).json(response);
    }

    // Paginated response
    static paginated(
        res: Response,
        data: any,
        page: number,
        limit: number,
        total: number,
        message: string = messages.SUCCESS.DATA_RETRIEVED
    ): Response {
        const response: IPaginatedResponse = {
            success: true,
            message,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
        return res.status(statusCodes.OK).json(response);
    }

    // Unauthorized response
    static unauthorized(
        res: Response,
        message: string = messages.ERROR.UNAUTHORIZED
    ): Response {
        return this.error(res, message, undefined, statusCodes.UNAUTHORIZED);
    }

    // Not found response
    static notFound(
        res: Response,
        message: string = messages.ERROR.NOT_FOUND
    ): Response {
        return this.error(res, message, undefined, statusCodes.NOT_FOUND);
    }

    // Bad request response
    static badRequest(
        res: Response,
        message: string = messages.ERROR.BAD_REQUEST,
        errors: any = null
    ): Response {
        return this.error(res, message, undefined, statusCodes.BAD_REQUEST, errors);
    }

    // Validation error response
    static validationError(res: Response, errors: any): Response {
        return this.error(
            res,
            messages.ERROR.VALIDATION_FAILED,
            undefined,
            statusCodes.UNPROCESSABLE_ENTITY,
            errors
        );
    }
}

export default ResponseHandler;
