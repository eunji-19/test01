import { User, UserModel } from "../models/user";
import { BrainToken, BrainTokenModel } from "../models/brainToken";

/**
 * User 생성 (신규가입)
 */
const createUser = async (user: User): Promise<User> => {
  const newUser = new UserModel(user);
  return await newUser.save();
};

/**
 * Email로 User 찾기
 */
const findUserByEmail = async (email: string): Promise<User | null> => {
  const findUser = await UserModel.findOne({ email: email });
  return findUser;
};

/**
 * DeepBrain 토큰 찾기
 */
const findDeepBrainTokenByEmail = async (
  email: string
): Promise<BrainToken | null> => {
  const findToken = await BrainTokenModel.findOne({ email: email });
  return findToken;
};

/**
 * DeepBrain 토큰 정보 업데이트
 */
const updateBrainToken = async (
  email: string,
  brainToken: BrainToken
): Promise<BrainToken | null> => {
  const updateToken = await BrainTokenModel.findOneAndUpdate(
    { email: email },
    {
      $set: {
        clientToken: brainToken.clientToken,
        clientToken_expires: brainToken.clientToken_expires,
        generateToken: brainToken.generateToken,
        generateToken_expires: brainToken.generateToken_expires,
      },
    }
  );
  return updateToken;
};

/**
 * DeepBrain 토큰 저장
 */
const createDeepBrainToken = async (
  brainToken: BrainToken
): Promise<BrainToken> => {
  const newBrainToken = new BrainTokenModel(brainToken);
  return await newBrainToken.save();
};

/**
 * DeepBrain 토큰 저장 후 User 업데이트
 */
const updateUserByBrainToken = async (
  email: string,
  brainToken: BrainToken
): Promise<User | null> => {
  const updateUser = await UserModel.findOneAndUpdate(
    { email: email },
    { $set: { brainToken: brainToken } },
    { new: true }
  );
  return updateUser;
};

/**
 * 로그인 후 JWT 토큰정보 저장
 */
const updateJWTInfo = async (
  accessToken: string,
  user: User
): Promise<User | null> => {
  const updateUser = await UserModel.findOneAndUpdate(
    { email: user.email },
    { $set: { access_token: accessToken } },
    { new: true }
  );
  return updateUser;
};

export default {
  createUser,
  findUserByEmail,
  findDeepBrainTokenByEmail,
  updateBrainToken,
  createDeepBrainToken,
  updateUserByBrainToken,
  updateJWTInfo,
};
