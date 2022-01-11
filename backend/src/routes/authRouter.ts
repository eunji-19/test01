import express, { Request, Response, NextFunction } from "express";
import { validationResult, check } from "express-validator";
import { userController } from "../controllers";
import { validationFunc, authMiddleware } from "../middlewares";
import { AuthRequest } from "../config/authRequest";

const router = express.Router();

/**
 * 로그인
 */
router.get(
  "/login",
  authMiddleware,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    const { user } = req;

    try {
      if (user) {
        res
          .status(200)
          .json({ statusMessage: { user, message: "로그인성공!" } });
      } else {
        res.status(200).json({ statusMessage: "로그인해주세요" });
      }
    } catch (err) {
      res.status(400).json({ statusMessage: err.message });
    }
  }
);

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userController.login(req, res, next);
      return result;
    } catch (err) {
      res.status(400).json({ statusMessage: err.message });
    }
  }
);

/**
 * 회원가입
 */
router.post(
  "/signup",
  [
    check("nickname", "닉네임은 필수입력입니다.").not().isEmpty(),
    check("email", "이메일형태를 다시 확인해주세요").isEmail(),
    check("password", "비밀번호는 6자리 이상이여야합니다.").isLength({
      min: 6,
    }),
    validationFunc,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userController.signUp(req, res, next);
      return result;
    } catch (err) {
      res.status(400).json({ statusMessage: err.message });
    }
  }
);

/**
 * 로그아웃
 */
router.get("/logout", (req: Request, res: Response) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json({ statusMessage: "로그아웃성공!" });
  } catch (err) {
    res.status(400).json({ statusMessage: err.message });
  }
});

export = router;
