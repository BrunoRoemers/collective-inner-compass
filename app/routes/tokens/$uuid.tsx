import { z } from "zod";
import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { token } from "~/schemas/token";
import getSearchParam from "~/utils/getSearchParam";
import { db } from "~/utils/db.server";
import isTokenExpired from "~/utils/isTokenExpired";
import bcrypt from "bcryptjs";
import { createSession } from "~/utils/session.server";

const tokenNotValidResponse = () =>
  json(
    {
      errorMessage: "token is not valid",
    },
    { status: 400 }
  );

export const loader = async ({ params, request }: DataFunctionArgs) => {
  const tokenId = z.string().uuid().parse(params.uuid);
  const tokenValue = token.parse(getSearchParam(request.url, "t"));

  const tokenRow = await db.authToken.findUniqueOrThrow({
    where: {
      id: tokenId,
    },
    select: {
      createdAt: true,
      invalidatedAt: true,
      hash: true,
      userId: true,
    },
  });

  // verify that token has not been invalidated
  if (tokenRow.invalidatedAt !== null) {
    console.log(`token ${tokenId} has invalidatedAt set`);
    return tokenNotValidResponse();
  }

  // verify that token has not expired
  if (isTokenExpired(tokenRow.createdAt)) {
    console.log(`token ${tokenId} is expired`);
    // TODO update tokens in db
    return tokenNotValidResponse();
  }

  // verify the token matches the hash
  const isTokenCorrect = await bcrypt.compare(tokenValue, tokenRow.hash);
  if (!isTokenCorrect) {
    console.error(`token ${tokenId} does not match with hash`);
    return tokenNotValidResponse();
  }

  // TODO set invalidatedAt of the token so it cannot be reused

  return createSession(tokenRow.userId);
};
