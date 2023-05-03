import { z } from "zod";
import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { zSecret } from "~/schemas/secret";
import getSearchParam from "~/utils/getSearchParam";
import { createSession } from "~/models/session.server";
import { consumeTokenForAccess, getToken } from "~/models/token.server";

export const loader = async ({ params, request }: DataFunctionArgs) => {
  const tokenId = z.string().uuid().parse(params.uuid);
  const secret = zSecret.parse(getSearchParam(request.url, "t"));

  const token = await getToken(tokenId);

  const user = await consumeTokenForAccess(token, secret).catch((e) => {
    console.debug(e);
    throw json({ errorMessage: "token is not valid" }, { status: 400 });
  });

  return createSession(user);
};
