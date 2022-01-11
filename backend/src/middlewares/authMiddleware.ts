import { Response, NextFunction } from "express";
import { verifyJWT } from "../config/jwt";
import { userService } from "../services";
import { AuthRequest } from "../config/authRequest";

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { access_token } = req.cookies;
  let user;
  if (access_token) {
    try {
      const userEmail = await verifyJWT(access_token);
      if (userEmail) {
        user = await userService.findUserByEmail(userEmail);
      }
      req.user = user;
    } catch (err) {
      next(err);
    }
  }
  next();
};

export { authMiddleware };
