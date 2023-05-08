import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import getSearchParam from "~/utils/getSearchParam";
import { createSession } from "~/models/session.server";
import { consumeTokenForAccess, getToken } from "~/models/token.server";
import { zSecret, zTokenId } from "~/schemas/token";

export const loader = async ({ params, request }: DataFunctionArgs) => {
  const tokenId = zTokenId.parse(params.uuid);
  const secret = zSecret.parse(getSearchParam(request.url, "t"));

  const token = await getToken(tokenId);

  const userId = await consumeTokenForAccess(token, secret).catch((e) => {
    console.debug(e);
    throw json({ errorMessage: "token is not valid" }, { status: 400 });
  });

  return createSession(userId);
};
