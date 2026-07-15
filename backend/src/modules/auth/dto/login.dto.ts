import { ClientInfoType } from "@/shared/util/client-info.util";

export interface UsernameLoginDto {
  username: string;
  password: string;
  client: ClientInfoType;
}

export interface EmailLoginDto {
  email: string;
  password: string;
  client: ClientInfoType;
}
