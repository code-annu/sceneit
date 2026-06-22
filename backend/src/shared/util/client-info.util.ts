import { Request } from "express";
import { injectable } from "inversify";
import { UAParser } from "ua-parser-js";

export interface ClientInfoType {
  deviceName?: string | undefined;
  deviceType?: string | undefined;
  ipAddress: string;
  userAgent?: string | undefined;
}

@injectable()
export default class ClientInfoUtil {
  getClientInfo(req: Request): ClientInfoType {
    const userAgent = req.headers["user-agent"];
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    return {
      ipAddress: req.ip ?? "",
      userAgent: result.ua,
      deviceType: result.device.type,
      deviceName: result.device.vendor,
    };
  }
}
