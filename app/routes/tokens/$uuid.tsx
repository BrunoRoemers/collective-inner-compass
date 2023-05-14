import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import getSearchParam from "~/utils/getSearchParam";
import { createSessionAndRedirect } from "~/models/session.server";
import { consumeTokenForAccess, getToken } from "~/models/token.server";
import { zSecret, zTokenId } from "~/schemas/token";
import { zRedirect } from "~/schemas/url";
import config from "~/config";
import { Form, Link, useLoaderData, useRouteError } from "@remix-run/react";
import { getIdOfAuthenticatedUser } from "~/models/session.server";
import { getUserById } from "~/models/user.server";
import { zUser } from "~/schemas/user";

export const loader = async ({ params, request }: DataFunctionArgs) => {
  const existingUserId = await getIdOfAuthenticatedUser(request);
  if (existingUserId !== undefined) {
    return getUserById(existingUserId);
  }

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

export const ErrorBoundary = () => {
  const error = useRouteError();
  console.error(error);
  return (
    <div className="p-2">
      <p>
        This token is not valid. It may have been used already, or has expired.
      </p>
      <Link to="/login">Back to the login page</Link>
    </div>
  );
};

export default () => {
  const user = zUser.parse(useLoaderData());
  return (
    <div className="p-2">
      You're already logged in as:{" "}
      <span className="font-bold">{user.email}</span>{" "}
      <Form action="/logout" method="post" className="inline-block">
        (
        <button type="submit" className="button hover:underline">
          Logout
        </button>
        )
      </Form>
      <Link to="/" className="hover:underline block">
        Back to the homepage
      </Link>
    </div>
  );
};