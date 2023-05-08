import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { destroySessionAndRedirect } from "~/models/session.server";

export const action = async ({ request }: ActionArgs) =>
  destroySessionAndRedirect(request);

export const loader = async () => redirect("/");
