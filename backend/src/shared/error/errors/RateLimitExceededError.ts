import AppError from "../AppError";

export default class RateLimitExceededError extends AppError {
  constructor(message: string, code: string, details?: unknown) {
    super({
      code,
      message,
      statusCode: 429,
      details: details,
    });
  }
}
