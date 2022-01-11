import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import fetch from "node-fetch";
import { userService } from "../services";
import { BrainToken } from "../models/brainToken";
import { signJWT } from "../config/jwt";

/**
 * 로그인
 */
const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
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
     * 로그인 성공하면 DeepBrainToken 발급과정 시작
     * 1. generateClientToken
     */
    const generateClientTokenURL = new URL(
      "https://dev.aistudios.com/api/odin/generateClientToken"
    );
    generateClientTokenURL.searchParams.append(
      "appId",
      process.env.DEEP_BRAIN_APPID
    );
    generateClientTokenURL.searchParams.append(
      "userKey",
      process.env.DEEP_BRAIN_USERKEY
    );

    const generateClientTokenFetch = await fetch(
      generateClientTokenURL.toString(),
      { method: "GET" }
    );
    const generateClientToken = await generateClientTokenFetch.json();

    console.log("----generate Brain Client Token----", generateClientToken);

    if (generateClientToken.succeed == false) {
      res.status(500).json({ statusMessage: "ClientToken 실패" });
      return;
    }

    /**
     * 2. generateToken 발급
     */
    const generateTokenURL = new URL(
      "https://dev.aistudios.com/api/odin/generateToken"
    );
    const body = {
      appId: process.env.DEEP_BRAIN_APPID,
      platform: "web",
      isClientToken: true,
      token: generateClientToken.token,
      uuid: process.env.DEEP_BRAIN_USERKEY,
      sdk_v: "1.0",
      clientHostname: process.env.DEEP_BRAIN_CLIENTHOSTNAME,
    };

    const generateTokenFetch = await fetch(generateTokenURL.toString(), {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const generateToken = await generateTokenFetch.json();

    console.log("----generate Brain Generate Token----", generateToken);

    if (generateToken.succeed == false) {
      res.status(500).json({ statusMessage: `${generateToken.description}` });
      return;
    }

    /**
     * DeepBrain 토큰 정보를 MONGODB에 저장한다
     * email을 통해서 사용자 구분
     */
    const brainToken: BrainToken = {
      email,
      clientToken: generateClientToken.token,
      clientToken_expires: generateClientToken.tokenExpire,
      generateToken: generateToken.token,
      generateToken_expires: generateToken.tokenExpire,
    };

    /**
     * 토큰 정보 있는지 확인 후 없으면 SAVE
     * 있으면 UPDATE
     */
    const findDeepBrainTokenByEmail =
      await userService.findDeepBrainTokenByEmail(email);

    if (findDeepBrainTokenByEmail) {
      console.log("----Already Token SAVE----", findDeepBrainTokenByEmail);
      const updateBrainToken = await userService.updateBrainToken(
        email,
        brainToken
      );
      if (!updateBrainToken) {
        res.status(400).json({ statusMessage: "토큰 정보 갱신 에러" });
      }
    } else {
      const createDeepBrainToken = await userService.createDeepBrainToken(
        brainToken
      );
      if (!createDeepBrainToken) {
        res.status(400).json({ statusMessage: "다시 로그인해주세요" });
      }
    }

    /**
     * 토큰 정보 저장 후 User 정보 또한 디비에서 업데이트
     */
    const updateUserByBrainToken = await userService.updateUserByBrainToken(
      email,
      brainToken
    );

    if (!updateUserByBrainToken) {
      res.status(400).json({ statusMessage: "로그인 실패" });
    }

    /**
     * 토큰정보 갱신 후 JWT 발급 진행
     * 1. signJWT를 User Email 통해 발급받는다.
     */
    const accessToken = await signJWT(updateUserByBrainToken.email);

    /**
     * 2. User에 access_token 정보 저장
     */
    const updateUserByJWT = await userService.updateJWTInfo(
      accessToken,
      updateUserByBrainToken
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
      maxAge: 18000000,
    });

    res.status(200).json({
      statusMessage: {
        access_token: accessToken,
        user: updateUserByJWT,
        message: "로그인성공!",
      },
    });
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
