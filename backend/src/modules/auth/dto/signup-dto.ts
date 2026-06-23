import z from "zod";
import { signupSchema } from "../schema/signup.schema";
import { ClientInfoType } from "@/shared/util/client-info.util";

export type SignupDTO = z.infer<typeof signupSchema> & {
  client: ClientInfoType;
};
