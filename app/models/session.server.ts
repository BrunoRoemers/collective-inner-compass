import type { Session } from "@remix-run/node";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import config from "~/config";
import type { Redirect } from "~/schemas/url";
import { zRedirect } from "~/schemas/url";
import type { UserId } from "~/schemas/user";
import { zUserId } from "~/schemas/user";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

interface SessionData {
  userId: string;
}

interface SessionFlashData {}

// TODO implement CSRF
// NOTE: cookie sessions need to be committed every time when:
//       - a session value is set
//       - a session value is unset
//       - a flash is read
const storage = createCookieSessionStorage<SessionData, SessionFlashData>({
  cookie: {
    // NOTE: defence in depth: the prefix may prevent session fixation in modern browsers
    // NOTE: the prefix prevents the cookie from being stored during development on http://localhost:3000 (not https)
    name:
      process.env.NODE_ENV === "production"
        ? "__Host-CIC_session"
        : "CIC_session",
    httpOnly: true,
    secure: true,
    sameSite: "lax", // NOTE: magic links don't work when this is set to "strict"
    path: "/",
    maxAge: 60 * 60 * 24 * 2, // 2 days, in seconds
    secrets: [sessionSecret],
  },
});

const getSession = (
  request: Request
): Promise<Session<SessionData, SessionFlashData>> => {
  return storage.getSession(request.headers.get("Cookie"));
};

export const getIdOfAuthenticatedUser = async (
  request: Request
): Promise<UserId | undefined> => {
  const session = await getSession(request);
  const userId = session.get("userId");
  return zUserId.optional().parse(userId);
};

export const requireAuthenticatedUser = async (
  request: Request,
  redirectTo: Redirect = zRedirect.parse(new URL(request.url).pathname)
): Promise<UserId> => {
  const userId = await getIdOfAuthenticatedUser(request);
  if (userId === undefined) {
    const searchParams = new URLSearchParams({
      [config.auth.urlParams.redirect]: redirectTo,
    });
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
};

export const createSessionAndRedirect = async (
  userId: UserId,
  redirectTo: Redirect
) => {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
};

export const destroySessionAndRedirect = async (request: Request) => {
  const session = await getSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
};
