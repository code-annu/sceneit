import { ClientInfoType } from "@/shared/util/client-info.util";

export interface LoginByUsernameDto {
  username: string;
  password: string;
  client: ClientInfoType;
}

export interface LoginByEmailDto {
  email: string;
  password: string;
  client: ClientInfoType;
}
