import { webcrypto } from "node:crypto";
import bcrypt from "bcryptjs";
import config from "~/config";
import { db } from "~/utils/db.server";
import type { Secret, Token, TokenId, TokenIdAndSecret } from "~/schemas/token";
import { zToken, zSecret, zTokenId } from "~/schemas/token";
import type { UserId } from "~/schemas/user";

const generateRandomSecret = async (): Promise<Secret> => {
  const byteArray = webcrypto.getRandomValues(
    new Uint8Array(config.auth.tokenSizeInBytes)
  );
  return zSecret.parse(Buffer.from(byteArray).toString("base64url"));
};

const enforceTokenCreationRateLimit = async (userId: UserId): Promise<void> => {
  const latestToken = await getLatestTokenOfUser(userId);
  if (!latestToken) {
    return;
  }

  const now = new Date();
  const timeDifferenceInMs = now.getTime() - latestToken.createdAt.getTime();
  if (timeDifferenceInMs < config.auth.tokenCreationDeltaInMs) {
    throw new Error("token creation rate limited");
  }
};

export const getLatestTokenOfUser = async (
  userId: UserId
): Promise<Token | null> => {
  const rawToken = await db.token.findFirst({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return zToken.nullable().parse(rawToken);
};

export const createToken = async (
  userId: UserId
): Promise<TokenIdAndSecret> => {
  await enforceTokenCreationRateLimit(userId);
  const secret = await generateRandomSecret();
  const tokenHash = await bcrypt.hash(secret, config.auth.hashSaltLength);
  const token = await db.token.create({
    data: {
      userId: userId,
      hash: tokenHash,
    },
  });
  return {
    tokenId: zTokenId.parse(token.id),
    secret: secret,
  };
};

export const consumeExistingTokens = async (userId: UserId): Promise<void> => {
  await db.token.updateMany({
    where: {
      userId: userId,
    },
    data: {
      consumedAt: new Date(),
    },
  });
};

export const consumeToken = async (tokenId: TokenId): Promise<void> => {
  await db.token.update({
    where: {
      id: tokenId,
    },
    data: {
      consumedAt: new Date(),
    },
  });
};

export const getToken = async (tokenId: TokenId): Promise<Token> => {
  const rawToken = await db.token.findUniqueOrThrow({
    where: {
      id: tokenId,
    },
  });
  return zToken.parse(rawToken);
};

const isTokenConsumed = async (token: Token): Promise<boolean> => {
  return token.consumedAt !== null;
};

const isTokenExpired = async (token: Token): Promise<boolean> => {
  const now = new Date();
  const timeDifferenceInMs = now.getTime() - token.createdAt.getTime();
  return (
    timeDifferenceInMs < 0 || timeDifferenceInMs > config.auth.tokenMaxAgeInMs
  );
};

const isTokenCounterfeit = async (token: Token, secret: string) => {
  return !(await bcrypt.compare(secret, token.hash));
};

export const consumeTokenForAccess = async (
  token: Token,
  secret: Secret
): Promise<UserId> => {
  if (await isTokenConsumed(token)) {
    throw new Error(`token ${token.id} is consumed`);
  }

  if (await isTokenExpired(token)) {
    await consumeToken(token.id);
    throw new Error(`token ${token.id} is expired`);
  }

  if (await isTokenCounterfeit(token, secret)) {
    throw new Error(`token ${token.id} is counterfeit`);
  }

  await consumeToken(token.id);

  return token.userId;
};
