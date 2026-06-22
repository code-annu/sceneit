// import { NextFunction, Request, Response } from "express";
// import JWTUtil, { JWTPayload } from "../util/jwt.util";
// import UnAuthorizedError from "../error/errors/UnAuthorizedError";
// import AuthErrorCode from "@/modules/auth/auth.error";

// export interface AuthRequest extends Request {
//   auth?: JWTPayload;
// }

// const jwtUtil = new JWTUtil();

// export default function authenticateUser(
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction,
// ) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     throw new UnAuthorizedError(
//       "Authorization token is required",
//       AuthErrorCode.MISSING_TOKEN,
//     );
//   }

//   const token = authHeader.substring("Bearer ".length).trim();

//   try {
//     const payload = jwtUtil.verifyAccessToken(token);
//     req.auth = payload;
//     next();
//   } catch (error) {
//     throw new UnAuthorizedError(
//       "Invalid or expired token",
//       AuthErrorCode.INVALID_TOKEN,
//     );
//   }
// }
