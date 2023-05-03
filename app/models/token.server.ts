import { webcrypto } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Token, User } from "@prisma/client";
import config from "~/config";
import { db } from "~/utils/db.server";
import { getUserById } from "./user.server";

const generateRandomSecret = async (): Promise<string> => {
  const byteArray = webcrypto.getRandomValues(
    new Uint8Array(config.tokenSizeInBytes)
  );
  return Buffer.from(byteArray).toString("base64url");
};

export const createToken = async (user: User): Promise<Token> => {
  const secret = await generateRandomSecret();
  const tokenHash = await bcrypt.hash(secret, config.hashSaltLength);
  return db.token.create({
    data: {
      userId: user.id,
      hash: tokenHash,
    },
  });
};

export const consumeExistingTokens = async (user: User): Promise<void> => {
  await db.token.updateMany({
    where: {
      userId: user.id,
    },
    data: {
      consumedAt: new Date(),
    },
  });
};

export const consumeToken = async (token: Token): Promise<void> => {
  await db.token.update({
    where: {
      id: token.id,
    },
    data: {
      consumedAt: new Date(),
    },
  });
};

export const getToken = async (tokenId: string): Promise<Token> => {
  return await db.token.findUniqueOrThrow({
    where: {
      id: tokenId,
    },
  });
};

const isTokenConsumed = async (token: Token): Promise<boolean> => {
  return token.consumedAt !== null;
};

const isTokenExpired = async (token: Token): Promise<boolean> => {
  const now = new Date();
  const timeDifferenceInMs = now.getTime() - token.createdAt.getTime();
  return timeDifferenceInMs < 0 || timeDifferenceInMs > config.tokenMaxAgeInMs;
};

const isTokenCounterfeit = async (token: Token, secret: string) => {
  return !(await bcrypt.compare(secret, token.hash));
};

export const consumeTokenForAccess = async (
  token: Token,
  secret: string
): Promise<User> => {
  if (await isTokenConsumed(token)) {
    throw new Error(`token ${token.id} is consumed`);
  }

  if (await isTokenExpired(token)) {
    await consumeToken(token);
    throw new Error(`token ${token.id} is expired`);
  }

  if (await isTokenCounterfeit(token, secret)) {
    throw new Error(`token ${token.id} is counterfeit`);
  }

  await consumeToken(token);

  return getUserById(token.userId);
};
