import type { IAuthUser } from "./common.interface.js";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: IAuthUser;
    }
  }
}

export {};
