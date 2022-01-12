import fetch from "node-fetch";
import { BrainToken } from "../models/brainToken";

/**
 * DeepBrain generateClientToken
 */
const generateClientToken = async (email: string) => {
  const generateClientTokenURL = new URL(
    `${process.env.DEEP_BRAIN_URL}/generateClientToken`
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

  const newGenerateToken = await generateToken(generateClientToken.token);

  const newBrainToken: BrainToken = {
    email,
    clientToken: generateClientToken.token,
    clientToken_expires: generateClientToken.tokenExpire,
    generateToken: newGenerateToken.token,
    generateToken_expires: newGenerateToken.tokenExpire,
  };

  return newBrainToken;
};

/**
 * DeepBrain generateToken
 */
const generateToken = async (token: string) => {
  const generateTokenURL = new URL(
    `${process.env.DEEP_BRAIN_URL}/generateToken`
  );
  const body = {
    appId: process.env.DEEP_BRAIN_APPID,
    platform: "web",
    isClientToken: true,
    token: token,
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
  return generateToken;
};

/**
 * DeepBrain getModelList
 */
const getModelList = async (token: string) => {
  const generateModelListURL = new URL(
    `${process.env.DEEP_BRAIN_URL}/getModelList`
  );
  const body = {
    appId: process.env.DEEP_BRAIN_APPID,
    platform: "web",
    isClientToken: true,
    token: token,
    uuid: process.env.DEEP_BRAIN_USERKEY,
    sdk_v: "1.0",
    clientHostname: process.env.DEEP_BRAIN_CLIENTHOSTNAME,
  };

  const generateModelListFetch = await fetch(generateModelListURL.toString(), {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  const generateModelList = await generateModelListFetch.json();
  return generateModelList;
};

/**
 * DeepBrain ModelInfo
 */
const getModelInfo = async (token: string, model: string) => {
  const getModelInfoURL = new URL(`${process.env.DEEP_BRAIN_URL}/getModelInfo`);
  const body = {
    appId: process.env.DEEP_BRAIN_APPID,
    platform: "web",
    isClientToken: true,
    token: token,
    uuid: process.env.DEEP_BRAIN_USERKEY,
    sdk_v: "1.0",
    clientHostname: process.env.DEEP_BRAIN_CLIENTHOSTNAME,
    model,
  };

  const getModelInfoFetch = await fetch(getModelInfoURL.toString(), {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  const generateModelInfo = await getModelInfoFetch.json();
  return generateModelInfo;
};

/**
 * DeepBrain makeVideo
 */
const makeVideo = async (
  token: string,
  language: string,
  text: string,
  model: string,
  clothes: string
) => {
  const getMakeVideoURL = new URL(`${process.env.DEEP_BRAIN_URL}/makeVideo`);
  const body = {
    appId: process.env.DEEP_BRAIN_APPID,
    platform: "web",
    isClientToken: true,
    token: token,
    uuid: process.env.DEEP_BRAIN_USERKEY,
    sdk_v: "1.0",
    clientHostname: process.env.DEEP_BRAIN_CLIENTHOSTNAME,
    language: language,
    text: text,
    model: model,
    clothes: clothes,
  };

  const generateMakeVideoFetch = await fetch(getMakeVideoURL.toString(), {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  const getMakeVideo = await generateMakeVideoFetch.json();
  return getMakeVideo;
};

/**
 * DeepBrain findProject
 */
const findProject = async (token: string, key: string) => {
  const getFindProjectURL = new URL(
    `${process.env.DEEP_BRAIN_URL}/findProject`
  );
  const body = {
    appId: process.env.DEEP_BRAIN_APPID,
    platform: "web",
    isClientToken: true,
    token: token,
    uuid: process.env.DEEP_BRAIN_USERKEY,
    sdk_v: "1.0",
    clientHostname: process.env.DEEP_BRAIN_CLIENTHOSTNAME,
    key,
  };

  const getFindProjectFetch = await fetch(getFindProjectURL.toString(), {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  const getFindProject = await getFindProjectFetch.json();
  return getFindProject;
};

export default {
  generateClientToken,
  generateToken,
  getModelList,
  getModelInfo,
  makeVideo,
  findProject,
};
