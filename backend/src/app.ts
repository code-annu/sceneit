import express from "express";
import container from "@/di/inversify.config";
import TYPES from "@/di/inversify.types";
import AuthRouter from "@/modules/auth/api/auth.router";
import errorHandler from "@/shared/middleware/error-handler.middleware";
import authenticateUser from "@/shared/middleware/authenticate.middleware";
import ProfileRouter from "@/modules/profile/api/profile.router";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRouter = container.get<AuthRouter>(TYPES.AuthRouter);
const profileRouter = container.get<ProfileRouter>(TYPES.ProfileRouter);

app.use("/api/auth", authRouter.getRouter());
app.use("/api/profile", authenticateUser, profileRouter.getRouter());

app.use(errorHandler);

export default app;
