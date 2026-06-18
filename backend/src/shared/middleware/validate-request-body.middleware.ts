import { NextFunction, Request, Response } from "express";
import { ZodObject, ZodError } from "zod";
import ErrorCode from "../error/ErrorCode";
import { BadRequestError, InternalServerError } from "../error/errors";

export const validateRequestBody =
  (schema: ZodObject<any>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError(
          "Missing or invalid request body",
          ErrorCode.INVALID_REQUEST_BODY,
          error.issues.map((issue) => ({
            message: issue.message,
            field: issue.path,
          })),
        );
      }
      const message =
        error instanceof Error ? error.message : "Invalid request body data";
      throw new InternalServerError(message, ErrorCode.INTERNAL_SERVER);
    }
  };
