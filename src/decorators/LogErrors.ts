import { Request, Response, NextFunction } from "express";
import { LoggerService } from "../services/LoggerService";

export function LogErrors(showInConsole: boolean = false) {
  const loggerService = new LoggerService(showInConsole);
  return function (target: any, propertyKey: string, descriptor: any): void {
    const originalMethod = descriptor.value!;
    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        await originalMethod.apply(this, [req, res, next]);
      } catch (error: any) {
        await loggerService.logError(
          target.constructor.name,
          propertyKey,
          error
        );
        if (!res.headersSent) {
          res.status(500).json({ message: error?.message });
        } else {
          next(error);
        }
      }
    };
  };
}
