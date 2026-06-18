import { NextFunction, Request, Response } from "express";
import AppError from "../error/AppError";
import ErrorCode from "../error/ErrorCode";

export default function (
  error: Error,
  _: Request,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      statusCode: error.statusCode,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  res.status(500).json({
    success: false,
    statusCode: 500,
    error: {
      code: ErrorCode.INTERNAL_SERVER,
      message: error.message,
    },
  });

  next();
}
