import { NextFunction, Request, Response } from "express";
import JWTUtil, { JWTPayload } from "../util/jwt.util";
import UnAuthorizedError from "../error/errors/UnAuthorizedError";
import AuthErrorCode from "@/modules/auth/AuthErrorCode";

export interface AuthRequest extends Request {
  auth?: JWTPayload;
}

const jwtUtil = new JWTUtil();

export default function authenticateUser(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnAuthorizedError(
      "Authorization token is required",
      AuthErrorCode.AUTH_TOKEN_MISSING,
    );
  }
  const token = authHeader.substring("Bearer ".length).trim();
  try {
    const payload = jwtUtil.verifyAccessToken(token);
    req.auth = payload;
    next();
  } catch (error) {
    throw new UnAuthorizedError(
      "Invalid or expired token",
      AuthErrorCode.INVALID_ACCESS_TOKEN,
    );
  }
}
