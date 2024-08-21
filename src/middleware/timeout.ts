import { Request, Response, NextFunction } from "express";

const timeoutMiddleware = (timeout: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res
          .status(503)
          .json({ message: "Service unavailable: Request timed out" });
      }
    }, timeout);

    const originalSend = res.send.bind(res);
    res.send = (...args) => {
      clearTimeout(timer);
      return originalSend(...args);
    };

    next();
  };
};

export default timeoutMiddleware;
