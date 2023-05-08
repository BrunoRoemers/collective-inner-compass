import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import getSearchParam from "~/utils/getSearchParam";
import { createSessionAndRedirect } from "~/models/session.server";
import { consumeTokenForAccess, getToken } from "~/models/token.server";
import { zSecret, zTokenId } from "~/schemas/token";
import { zRedirect } from "~/schemas/url";
import config from "~/config";

export const loader = async ({ params, request }: DataFunctionArgs) => {
  const tokenId = zTokenId.parse(params.uuid);
  const secret = zSecret.parse(
    getSearchParam(request.url, config.auth.urlParams.secret)
  );
  const redirectTo = zRedirect.parse(
    getSearchParam(request.url, config.auth.urlParams.redirect) ?? "/"
  );

  const token = await getToken(tokenId);

  const userId = await consumeTokenForAccess(token, secret).catch((e) => {
    console.debug(e);
    throw json({ errorMessage: "token is not valid" }, { status: 400 });
  });

  return createSessionAndRedirect(userId, redirectTo);
};
