import z from "zod";
import { refreshTokenSchema } from "../schema/refresh-token.schema";
import { ClientInfoType } from "@/shared/util/client-info.util";

export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema> & {
  client: ClientInfoType;
};
