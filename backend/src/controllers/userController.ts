import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import fetch from "node-fetch";
import { userService, deepBrainService } from "../services";
import { signJWT } from "../config/jwt";
import { User } from "../models/user";
import { BrainToken } from "../models/brainToken";

/**
 * 로그인
 */
const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  let updateToken: BrainToken;

  try {
    console.log("----user login start----");

    /**
     * 있는 유저인지 확인
     */
    const existingUser = await userService.findUserByEmail(email);
    if (!existingUser) {
      res.status(400).json({ statusMessage: "회원정보가 없습니다" });
    }

    /**
     * 비밀번호 확인 및 로그인 진행
     */
    const validPassword = await bcrypt.compare(password, existingUser.password);

    if (!validPassword) {
      res.status(400).json({ statusMessage: "비밀번호를 다시 확인해주세요" });
    }

    /**
     * 로그인 성공하면 DeepBrainToken API를 통해 토큰 발급과정 진행
     * 1. 발급받았던 토큰 있는 지 체크하고 Expire 여부 확인
     * - 발급받았던 토큰이 없는 경우 -> 새로운 토큰 발급
     * - 기존 발급받은 토큰 있지만 Expire O -> 새로운 토큰 발급 & token 정보 mongodb Update
     * - 기존 발급받은 토큰 있지만 Expire X -> 기존의 토큰으로 계속 진행
     *
     * 2. 새로운 토큰 발급
     * - DeepBrain generateClientToken 발급
     * - 위의 토큰을 통해 DeepBrain generateToken 발급
     * - clientToken, generateToken 모두 각각의 expiresIn과 함께 mongodb 저장
     *
     * 3. 발급받은 토큰 통해서 JWT 발급
     * - DeepBrain Token을 통해 signJWT 함수 이용해 발급
     * - User에 signJWT통해 발급받은 토큰 정보 저장 (access_token)
     * - 로그인을 위해 res.cookie에 access_token으로 저장
     */

    console.log("----1. 토큰여부 확인----", existingUser.brainToken);
    if (existingUser.brainToken.length !== 0) {
      console.log("----1.1 토큰있음 -> Expires 여부 확인-----");
      const expireToken = await deepBrainService.getModelList(
        existingUser.brainToken[0].generateToken
      );

      /**
       * 기존에 발급받은 토큰이 만료된 경우
       */
      if (expireToken.errorCode === 1402) {
        console.log("----1.1 토큰있음 -> 만료됨----");
        const newToken = await deepBrainService.generateClientToken(email);
        updateToken = await userService.updateBrainToken(email, newToken);
        if (!updateToken) {
          res.status(400).json({ statusMessage: "토큰 정보 업데이트 에러" });
        }
      } else {
        console.log("----1.1 토큰있음 -> 유효함----");
        /**
         * JWT발급 진행 -> DeepBrain API에서 발급받은 token 활용
         */
        const accessToken = await signJWT(
          existingUser.brainToken[0].generateToken
        );

        /**
         * User에 access_token 정보 저장
         */
        const updateUserByJWT = await userService.updateJWTInfo(
          accessToken,
          existingUser
        );

        if (!updateUserByJWT) {
          res
            .status(400)
            .json({ statusMessage: "서버문제 다시 로그인시도 해주세요" });
        }

        /**
         * res.cookie에 access_token으로 저장함 (JWT)
         */
        res.cookie("access_token", accessToken, {
          httpOnly: true,
          secure: false,
          maxAge: 60 * 60 * 5,
        });

        res.status(200).json({
          statusMessage: {
            access_token: accessToken,
            user: updateUserByJWT,
            message: "로그인성공!",
          },
        });
      }
    } else {
      const newToken = await deepBrainService.generateClientToken(email);
      if (!newToken) {
        res.status(400).json({ statusMessage: "토큰 정보 업데이트 에러" });
      }
      /**
       * JWT발급 진행 -> DeepBrain API에서 발급받은 token 활용
       */
      const accessToken = await signJWT(newToken.generateToken);

      const updateUserByJWT = await userService.updateJWTInfo(
        accessToken,
        existingUser
      );

      if (!updateUserByJWT) {
        res
          .status(400)
          .json({ statusMessage: "서버문제 다시 로그인시도 해주세요" });
      }

      /**
       * res.cookie에 access_token으로 저장함 (JWT)
       */
      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: false,
        maxAge: 60 * 60 * 5,
      });

      res.status(200).json({
        statusMessage: {
          access_token: accessToken,
          user: updateUserByJWT,
          message: "로그인성공!",
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * 회원가입
 */
const signUp = async (req: Request, res: Response, next: NextFunction) => {
  const { nickname, email, password } = req.body;

  try {
    console.log("----user signup start----");
    /**
     * 이미 가입한 사용자 확인
     */
    const existUser = await userService.findUserByEmail(email);
    if (existUser) {
      res.status(400).json({ statusMessage: "이미있는 사용자입니다." });
      //   throw new Error("이미 있는 사용자입니다.");
    }

    /**
     * 비밀번호 암호화
     */
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    /**
     * 새로운 사용자
     */
    const createdUser = await userService.createUser({
      nickname,
      email,
      password: hashedPassword,
    });
    res
      .status(200)
      .json({ statusMessage: { createdUser, message: "회원가입 성공" } });
  } catch (err) {
    next(err);
  }
};

export default { login, signUp };
