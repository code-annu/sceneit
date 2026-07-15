import { ClientInfoType } from "@/shared/util/client-info.util";

export interface SignupDto {
  username: string;
  email: string;
  password: string;
  client: ClientInfoType;
}
