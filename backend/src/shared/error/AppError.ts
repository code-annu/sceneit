import ErrorCode from "./ErrorCode";
import ErrorType from "./ErrorType";

export default class AppError extends Error {
  statusCode: number;
  message: string;
  isOperational: boolean;
  type: ErrorType;
  code: ErrorCode;
  details: any[] | undefined;

  constructor(input: AppErrorInput) {
    const { message, statusCode, type, code, details, isOperational } = input;
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.type = type;
    this.isOperational = isOperational || true;
    this.code = code;
    this.details = details;
  }
}

interface AppErrorInput {
  message: string;
  statusCode: number;
  type: ErrorType;
  code: ErrorCode;
  details?: any[] | undefined;
  isOperational?: boolean;
}
