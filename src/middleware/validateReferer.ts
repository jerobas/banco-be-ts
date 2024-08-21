import { Request, Response, NextFunction } from "express";

const validateRefere = (req: Request, res: Response, next: NextFunction) => {
  const url = process.env.URL_REQUEST;

  const referer = req.headers.host || req.headers.referer || req.headers.origin;
  
  if (!referer && referer !== url) {
    return res
      .status(403)
      .json({ message: "Forbidden: Invalid request source" });
  }
  next();
};
export default validateRefere;
