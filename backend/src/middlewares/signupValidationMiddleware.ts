import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

// LOGIN POST PARAMETER 유효성 체크
const validationFunc = (req: Request, res: Response, next: NextFunction) => {
  const error = validationResult(req);
  if (!error.isEmpty()) return res.status(400).json({ statusMessage: error });
  next();
};

export { validationFunc };
