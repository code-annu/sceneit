import AppError from "./AppError";
import ErrorCode from "./ErrorCode";
import ErrorType from "./ErrorType";

export class NotFoundError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.RESOURCE_NOT_FOUND) {
    super({
      code,
      message,
      statusCode: 404,
      type: ErrorType.NOT_FOUND,
    });
  }
}

export class UnAuthorizedError extends AppError {
  constructor(message: string, code: ErrorCode) {
    super({
      code,
      message,
      statusCode: 401,
      type: ErrorType.UNAUTHORIZED,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, code: ErrorCode) {
    super({
      code,
      message,
      statusCode: 403,
      type: ErrorType.FORBIDDEN,
    });
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, code: ErrorCode, details?: any[]) {
    super({
      code,
      message,
      statusCode: 400,
      type: ErrorType.BAD_REQUEST,
      details: details,
    });
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message: string, code: ErrorCode) {
    super({
      code,
      message,
      statusCode: 422,
      type: ErrorType.UNPROCESSABLE_ENTITY,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: ErrorCode) {
    super({
      code,
      message,
      statusCode: 409,
      type: ErrorType.CONFLICT,
    });
  }
}

export class RateLimitExceededError extends AppError {
  constructor(message: string, code: ErrorCode) {
    super({
      code,
      message,
      statusCode: 429,
      type: ErrorType.RATE_LIMIT_EXCEEDED,
    });
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, code: ErrorCode) {
    super({
      code,
      message,
      statusCode: 500,
      type: ErrorType.INTERNAL_SERVER,
      isOperational: false,
    });
  }
}
