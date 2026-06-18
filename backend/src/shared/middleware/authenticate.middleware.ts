// import { NextFunction, Request, Response } from "express";

// export interface AuthRequest extends Request {
//   auth?: JWTPayload;
// }

// export default async function authenticateUser(
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction,
// ) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     throw new MissingTokenError("Authorization token is required");
//   }

//   const token = authHeader.substring("Bearer ".length).trim();

//   try {
//     const payload = await verifyAccessToken(token);
//     req.auth = payload;
//     next();
//   } catch (error) {
//     throw new InvalidTokenError("Invalid or expired token");
//   }
// }

/*export const validateApiKey = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = req.header("x-api-key");
  if (!apiKey) {
    throw new UnauthorizedError(
      "Api key is required to preform this action",
      ErrorTypes.MISSING_API_KEY,
    );
  }

  const user = await userRepo.findByApiKey(apiKey);
  if (!user) {
    throw new NotFoundError("Api key not found");
  }

  req.auth = {
    userId: user.id,
    email: user.email,
  };

  next();
};*/
