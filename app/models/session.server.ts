import { z } from "zod";
import type { Session } from "@remix-run/node";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import type { User } from "@prisma/client";

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
    sameSite: "strict",
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

export const getUserId = async (
  request: Request
): Promise<string | undefined> => {
  const session = await getSession(request);
  const userId = session.get("userId");
  return z.string().uuid().optional().parse(userId);
};

export const requireUserId = async (request: Request): Promise<string> => {
  const userId = await getUserId(request);
  if (userId === undefined) {
    throw redirect(`/login`);
  }
  return userId;
};

export const createSession = async (user: User) => {
  const session = await storage.getSession();
  session.set("userId", user.id);
  // TODO dynamic redirect
  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
};
