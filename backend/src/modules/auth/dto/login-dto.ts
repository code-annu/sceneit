import { emailLoginSchema, usernameLoginSchema } from "../schema/login.schema";
import z from "zod";
import { ClientInfoType } from "@/shared/util/client-info.util";

export type UsernameLoginDTO = z.infer<typeof usernameLoginSchema> & {
  client: ClientInfoType;
};

export type EmailLoginDTO = z.infer<typeof emailLoginSchema> & {
  client: ClientInfoType;
};
